import { takeEvery, call, all, put } from 'redux-saga/effects';
import { fromJS } from 'immutable';
import { reset, startSubmit, stopSubmit } from 'redux-form';
import {
  UPDATE_SELECTED_PROJECT_CODE,
  LOAD_PROJECT_CODES,
  OTHER_PROJECT_CLICKED,
  SUBMIT_NEW_TASK_FORM_AND_CLOSE_IT,
  SUBMIT_NEW_ACTIVITY_FORM_AND_CLOSE_IT,
  SUBMIT_NEW_TASK_FORM,
  SUBMIT_NEW_ACTIVITY_FORM,
  DISMISS_NEW_ACTIVITY_DIALOG,
  DISMISS_NEW_TASK_DIALOG,
  NEW_TASK_FORM_ID,
  NEW_ACTIVITY_FORM_ID,
  EXPAND_TASK_LIST_ITEM,
  LOAD_USERS,
  SUBMIT_ADD_PEOPLE_FORM_AND_CLOSE_IT,
  ADD_PEOPLE_FORM_ID,
} from './constants';

import {
  loadedSelectedProject,
  endProjectCodesLoading,
  dismissNewTaskDialog,
  dismissNewActivityDialog,
  updateSelectedProjectId,
  tasksLoaded,
  endedUsersLoading,
  updateMemberList,
} from './actions';

import {
  getProjects,
  getProject,
  // getProjectAccountable,
  getProjectMembers,
  getProjectActivities,
  createActivity,
  getActivityTasks,
  getPeople,
  addPeopleToProject,
} from '../../support/backend/KowalskiBackendClient';

import { requestErrorReceived } from '../App/actions';

import { handleProjectSelected } from '../ProjectsPage/saga';
import { genCommonReqConfig } from '../../support/backend/utils';

export function* handleSelectedProjectId({ payload }) {
  const commonConfig = {
    ...genCommonReqConfig(),
    projectId: payload,
  };

  try {
    const [project, members, activities] = yield (all([
      call(getProject, commonConfig),
      call(getProjectMembers, commonConfig),
      call(getProjectActivities, commonConfig),
    ]));

    yield put(loadedSelectedProject({
      success: true,
      data: fromJS({ ...project, people: members, activities }),
    }));
  } catch (e) {
    yield put(requestErrorReceived({
      error: e,
      dispatchOnAuthError: [
        loadedSelectedProject({ success: false, errorMsg: '' }),
      ],
      dispatchOnOtherErrors: [
        loadedSelectedProject({ success: false, errorMsg: 'There was an error while trying to communicate with the server =(' }),
      ],
    }));
  }
}

export function* handleLoadProjectCodes() {
  try {
    const projects = yield call(
      getProjects,
      genCommonReqConfig(),
    );
    const projectCodes = projects.map((project) => ({ id: project.projectId, code: project.code }));
    yield put(endProjectCodesLoading({ success: true, data: fromJS(projectCodes) }));
  } catch (e) {
    yield put(requestErrorReceived({
      error: e,
      dispatchOnAuthError: [
        endProjectCodesLoading({ success: false, errorMsg: '' }),
      ],
      dispatchOnOtherErrors: [
        endProjectCodesLoading({ success: false, errorMsg: 'There was an error while trying to communicate with the server =(' }),
      ],
    }));
  }
}

export function* handleSubmitNewTaskForm({ payload }) {
  yield put(startSubmit(NEW_TASK_FORM_ID));
  try {
    yield call(
      createActivity, {
        ...genCommonReqConfig(),
        activityData: payload.toJSON(),
      }
    );
    yield put(stopSubmit(NEW_TASK_FORM_ID));
    // yield put(startProjectLoading());
    return true;
  } catch (e) {
    yield put(requestErrorReceived({
      error: e,
      dispatchOnAuthError: [stopSubmit(NEW_TASK_FORM_ID)],
      dispatchOnOtherErrors: [
        stopSubmit(
          NEW_TASK_FORM_ID,
          { _error: 'There was an error while trying to communicate with the server =(' },
        ),
      ],
    }));
  }

  return false;
}

export function* handleSubmitNewTaskFormAndCloseIt({ payload: { taskData, activity, project } }) {
  yield handleSubmitNewTaskForm({ payload: { taskData, activity, project } });
  yield put(dismissNewTaskDialog());
}

export function* handleSubmitNewActivityForm({ payload }) {
  yield put(startSubmit(NEW_ACTIVITY_FORM_ID));
  try {
    yield call(createActivity, {
      ...genCommonReqConfig(),
      projectId: payload.get('projectId'),
      activityData: payload.toJSON(),
    });
    yield put(stopSubmit(NEW_ACTIVITY_FORM_ID));
    yield put(updateSelectedProjectId(payload.get('projectId')));
    return true;
  } catch (e) {
    yield put(requestErrorReceived({
      error: e,
      dispatchOnAuthError: [stopSubmit(NEW_ACTIVITY_FORM_ID)],
      dispatchOnOtherErrors: [
        stopSubmit(
          NEW_ACTIVITY_FORM_ID,
          { _error: 'There was an error while trying to communicate with the server =(' },
        ),
      ],
    }));
  }

  return false;
}

export function* handleSubmitNewActivityFormAndCloseIt({ payload }) {
  const successful = yield handleSubmitNewActivityForm({ payload });
  if (successful) {
    yield put(dismissNewActivityDialog());
  }
}

export function* clearTaskForm() {
  yield put(reset(NEW_TASK_FORM_ID));
}

export function* clearActivityForm() {
  yield put(reset(NEW_ACTIVITY_FORM_ID));
}

export function* handleFetchTaskList({ payload: { activityId, projectId } }) {
  try {
    const tasks = yield call(getActivityTasks, {
      ...genCommonReqConfig(),
      activityId,
      projectId,
    });
    yield put(tasksLoaded({ activityId, taskList: fromJS(tasks) }));
  } catch (e) {
    yield put(requestErrorReceived({
      error: e,
      dispatchOnAuthError: [stopSubmit(NEW_ACTIVITY_FORM_ID)],
      dispatchOnOtherErrors: [
        stopSubmit(
          NEW_ACTIVITY_FORM_ID,
          { _error: 'There was an error while trying to communicate with the server =(' },
        ),
      ],
    }));
  }
}

export function* handleLoadUsers() {
  try {
    const users = yield call(
      getPeople,
      genCommonReqConfig(),
    );
    yield put(endedUsersLoading({ success: true, data: fromJS(users) }));
  } catch (e) {
    yield put(requestErrorReceived({
      error: e,
      dispatchOnAuthError: [
        endedUsersLoading({ success: false, errorMsg: '' }),
      ],
      dispatchOnOtherErrors: [
        endedUsersLoading({ success: false, errorMsg: 'There was an error while trying to communicate with the server =(' }),
      ],
    }));
  }
}

export function* handleSubmitAddPeopleForm({ payload }) {
  const projectId = payload.get('projectId');
  const peopleIds = payload.get('people');
  yield put(startSubmit(ADD_PEOPLE_FORM_ID));
  try {
    const updatedMemberList = yield call(
      addPeopleToProject, { ...genCommonReqConfig(), projectId, peopleIds }
    );
    yield put(stopSubmit(ADD_PEOPLE_FORM_ID));
    yield put(updateMemberList(updatedMemberList));
  } catch (e) {
    yield put(requestErrorReceived({
      error: e,
      dispatchOnAuthError: [stopSubmit(ADD_PEOPLE_FORM_ID)],
      dispatchOnOtherErrors: [
        stopSubmit(
          ADD_PEOPLE_FORM_ID,
          { _error: 'There was an error while trying to communicate with the server =(' },
        ),
      ],
    }));
  }

  return false;
}

// Individual exports for testing
export default function* defaultSaga() {
  yield takeEvery(UPDATE_SELECTED_PROJECT_CODE, handleSelectedProjectId);
  yield takeEvery(LOAD_PROJECT_CODES, handleLoadProjectCodes);
  yield takeEvery(LOAD_USERS, handleLoadUsers);
  yield takeEvery(OTHER_PROJECT_CLICKED, handleProjectSelected);
  yield takeEvery(SUBMIT_NEW_TASK_FORM, handleSubmitNewTaskForm);
  yield takeEvery(SUBMIT_NEW_TASK_FORM_AND_CLOSE_IT, handleSubmitNewTaskFormAndCloseIt);
  yield takeEvery(SUBMIT_NEW_ACTIVITY_FORM, handleSubmitNewActivityForm);
  yield takeEvery(SUBMIT_NEW_ACTIVITY_FORM_AND_CLOSE_IT, handleSubmitNewActivityFormAndCloseIt);
  yield takeEvery(DISMISS_NEW_ACTIVITY_DIALOG, clearActivityForm);
  yield takeEvery(DISMISS_NEW_TASK_DIALOG, clearTaskForm);
  yield takeEvery(EXPAND_TASK_LIST_ITEM, handleFetchTaskList);
  yield takeEvery(SUBMIT_ADD_PEOPLE_FORM_AND_CLOSE_IT, handleSubmitAddPeopleForm);
}
