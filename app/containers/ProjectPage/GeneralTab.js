import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import { FormattedMessage } from 'react-intl';
import Modal from 'components/Modal/Loadable';
import ErrorMessageBox from 'components/ErrorMessageBox/Loadable';
import AddPeopleForm from './AddPeopleForm';
import PeopleFlexGrid from '../../components/PeopleFlexGrid';
import { userCanAccess } from '../../support/auth/utils';
import { ADD } from '../../support/auth/resources';
import messages from './messages';
import { updateProjectAttribute } from './actions';
import { makeSelectUpdateProjectAttributesStatus, makeSelectUpdateProjectAttributesErrorMsg } from './selectors';
import InlineTextEdit from '../../components/InlineTextEdit';

const ProjectNameWrapper = styled.div`
  margin-right: 2rem;
  font-size: 1.8rem;
  padding-bottom: 1rem;
`;

const ProjectInfoWrapper = styled.div`
  margin-right: 2rem;
  display: flex;
  padding-bottom: 1rem;
`;

const ProjectStartDateHeader = styled.h4`
`;

const ProjectStartDateContent = styled.div`
`;

const ProjectEndDateHeader = styled.h4`
`;

const ProjectEndDateContent = styled.div`
`;

const ProjectStartDateWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const ProjectEndDateWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const ProjectDescriptionWrapper = styled.div`
  margin-right: 2rem;
  padding-bottom: 1.8rem;
`;

const ProjectDescriptionHeader = styled.h4`
`;

const ProjectDescriptionContent = styled.div`
`;

const ProjectPeopleWrapper = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const ProjectPeopleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  flex-grow: 0;
  margin-botton: 10px;
`;

const ProjectPeopleContent = styled.div`
  flex-grow: 1;
  border-left: 1px solid #dbdbdb;
  border-top: 1px solid #dbdbdb;
  border-right: 1px solid #dbdbdb;
  margin-top: 0.8rem;
  margin-right: 2rem;
  padding-right: 3rem;
  padding-top: 1rem;
`;

const AddPeopleButton = styled.button`
  margin-right: 2rem;
  margin-botton: 1rem;
  width:186px;
  height:50px !important;
  border-radius:2px;
  border:1px solid #654EA3;
  color: white;
`;

const ErrorMsgBoxWrapper = styled.div`
  display: flex;
  margin-right: 2rem;
  padding-bottom: 1rem;
`;

export function GeneralTab(props) {
  const {
    project,
    isAddPeopleFormOpen,
    closeAddPeopleForm,
    usersNotInProject,
    updateProjectAttributesErrorMsg,
  } = props;

  if (!project) {
    return <div></div>;
  }

  const projectId = project.get('projectId');

  return (
    <div style={{ flexGrow: '1', display: 'flex', flexDirection: 'column' }}>
      <ErrorMsgBoxWrapper>
        <ErrorMessageBox errorMsg={updateProjectAttributesErrorMsg} />
      </ErrorMsgBoxWrapper>
      <ProjectNameWrapper>
        <InlineTextEdit
          onCommit={(name) => props.updateProjectAttribute(Map({ name, projectId }))}
          saving={props.updateProjectAttributesStatus.get('name')}
        >
          {project.get('name')}
        </InlineTextEdit>
      </ProjectNameWrapper>
      <ProjectInfoWrapper className="columns">
        <ProjectStartDateWrapper className="column">
          <ProjectStartDateHeader>
            <FormattedMessage {... messages.generalTabProjectStartDate} />
          </ProjectStartDateHeader>
          <ProjectStartDateContent>
            <InlineTextEdit
              onCommit={(startDate) => props.updateProjectAttribute(Map({ startDate, projectId }))}
              saving={props.updateProjectAttributesStatus.get('startDate')}
            >
              {project.get('startDate')}
            </InlineTextEdit>
          </ProjectStartDateContent>
        </ProjectStartDateWrapper>
        <ProjectEndDateWrapper className="column">
          <ProjectEndDateHeader>
            <FormattedMessage {... messages.generalTabProjectEndDate} />
          </ProjectEndDateHeader>
          <ProjectEndDateContent>
            <InlineTextEdit
              onCommit={(endDate) => props.updateProjectAttribute(Map({ endDate, projectId }))}
              saving={props.updateProjectAttributesStatus.get('endDate')}
            >
              {project.get('endDate')}
            </InlineTextEdit>
          </ProjectEndDateContent>
        </ProjectEndDateWrapper>
      </ProjectInfoWrapper>
      <ProjectDescriptionWrapper>
        <ProjectDescriptionHeader>
          <FormattedMessage {... messages.generalTabProjectDescription} />
        </ProjectDescriptionHeader>
        <ProjectDescriptionContent>
          <InlineTextEdit
            onCommit={(description) => props.updateProjectAttribute(Map({ description, projectId }))}
            saving={props.updateProjectAttributesStatus.get('description')}
          >
            {project.get('description')}
          </InlineTextEdit>
        </ProjectDescriptionContent>
      </ProjectDescriptionWrapper>
      <ProjectPeopleWrapper>
        <ProjectPeopleHeader>
          <div style={{ display: 'flex', flexDirection: 'column-reverse' }}>
            <h4>
              <FormattedMessage {... messages.generalTabProjectPeople} />
            </h4>
          </div>
          {
            userCanAccess(ADD.PERSON_TO_PROJECT) &&
              <AddPeopleButton className="button primary-button" onClick={props.openAddPeopleForm}>
                <FormattedMessage {... messages.generalTabProjectAddPeople} />
              </AddPeopleButton>
          }
        </ProjectPeopleHeader>
        <ProjectPeopleContent>
          <PeopleFlexGrid people={project.get('people')} />
        </ProjectPeopleContent>
        <Modal active={isAddPeopleFormOpen} onDismiss={closeAddPeopleForm}>
          <AddPeopleForm
            availableUsers={usersNotInProject}
            onAdd={props.submitAddPeopleFormAndCloseIt}
            onCancel={closeAddPeopleForm}
            project={props.project}
          />
        </Modal>
      </ProjectPeopleWrapper>
    </div>
  );
}

GeneralTab.propTypes = {
  project: PropTypes.object,
  isAddPeopleFormOpen: PropTypes.bool.isRequired,
  closeAddPeopleForm: PropTypes.func.isRequired,
  openAddPeopleForm: PropTypes.func.isRequired,
  submitAddPeopleFormAndCloseIt: PropTypes.func.isRequired,
  usersNotInProject: PropTypes.instanceOf(List).isRequired,
  updateProjectAttributesStatus: PropTypes.object.isRequired,
  updateProjectAttribute: PropTypes.func.isRequired,
  updateProjectAttributesErrorMsg: PropTypes.string,
};

const mapStateToProps = createStructuredSelector({
  updateProjectAttributesStatus: makeSelectUpdateProjectAttributesStatus(),
  updateProjectAttributesErrorMsg: makeSelectUpdateProjectAttributesErrorMsg(),
});

const withConnect = connect(mapStateToProps, { updateProjectAttribute });

export default compose(
  withConnect,
)(GeneralTab);
