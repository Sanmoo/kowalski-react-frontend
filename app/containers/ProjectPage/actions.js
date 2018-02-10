/*
 *
 * ProjectPage actions
 *
 */

import {
  DEFAULT_ACTION,
  UPDATE_SELECTED_PROJECT_CODE,
  LOADED_SELECTED_PROJECT,
  LOAD_PROJECT_CODES,
  LOADED_PROJECT_CODES,
  SELECTED_TAB_CHANGED,
  OTHER_PROJECT_CLICKED,
} from './constants';

export function defaultAction() {
  return {
    type: DEFAULT_ACTION,
  };
}

export function updateSelectedProjectCode(projectCode) {
  return {
    type: UPDATE_SELECTED_PROJECT_CODE,
    payload: projectCode,
  };
}

export function otherProjectClicked(projectCode) {
  return {
    type: OTHER_PROJECT_CLICKED,
    payload: projectCode,
  }
}

export function loadedSelectedProject(projectData) {
  return {
    type: LOADED_SELECTED_PROJECT,
    payload: projectData,
  };
}

export function loadProjectCodes() {
  return {
    type: LOAD_PROJECT_CODES,
  };
}

export function loadedProjectCodes(projectCodes) {
  return {
    type: LOADED_PROJECT_CODES,
    payload: projectCodes,
  };
}

export function selectedTabChanged(index) {
  return {
    type: SELECTED_TAB_CHANGED,
    payload: index,
  };
}
