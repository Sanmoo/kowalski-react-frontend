/**
 *
 * TimesheetPage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { FormattedMessage, FormattedDate } from 'react-intl';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import styled from 'styled-components';
import isBefore from 'date-fns/is_before';
import addDays from 'date-fns/add_days';

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import { Switch, Route } from 'react-router-dom';
import AppCalendar from 'components/AppCalendar';
import DayColumn from 'components/DayColumn/Loadable';
import * as actions from './actions';
import { makeSelectSelectedDate, makeSelectSelectedRange } from './selectors';
import reducer from './reducer';
import saga from './saga';
import messages from './messages';
import LogHourForm from './LogHourForm';

const MainContainerWrapper = styled.div`
  display: flex;
`;

const ColumnsWrapper = styled.div`
  flex-grow: 1;
  display: flex;
`;

const CalendarColumn = styled.div`
  border-right: solid 1px #ccc;
  width: 333px;
  flex-grow: 0 !important;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const TimeSheetLabelWrapper = styled.div`
  padding: 10px;
`;

const TimeSheetLabelInsideWrapper = styled.div`
  font-size: 1.3rem;
`;

const DayColumnsWrapper = styled.div`
  display: flex !important;
  flex-grow: 1 !important;
  flex-direction: column !important;
`;

const AboveDaysArea = styled.div`
  display: flex;
  flex-direction: row;
  flex-basis: 15px;
  flex-grow: 0;
`;

const DaysArea = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: row;
`;

const renderDays = ([rangeStart, rangeEnd], history) => {
  const dayColumns = [];
  let currentDate = rangeStart;
  while (isBefore(currentDate, rangeEnd)) {
    dayColumns.push(<DayColumn key={currentDate.getTime()} day={currentDate} onFreeSlotClick={() => history.push('/log')} />);
    currentDate = addDays(currentDate, 1);
  }
  return dayColumns;
};

function TimesheetPage(props) {
  return (
    <MainContainerWrapper className="kowalski-react-basic-container">
      <Helmet>
        <title>TimesheetPage</title>
        <meta name="description" content="Description of TimesheetPage" />
      </Helmet>
      <ColumnsWrapper className="columns">
        {/* Calendar */}
        <CalendarColumn className="column">
          <TimeSheetLabelWrapper>
            <TimeSheetLabelInsideWrapper>
              <FormattedMessage {... messages.timesheetLabel} />
            </TimeSheetLabelInsideWrapper>
            <span>
              <FormattedDate value={props.selectedRange[0]} /> -
              <FormattedDate value={props.selectedRange[1]} />
            </span>
          </TimeSheetLabelWrapper>
          <AppCalendar
            selectedDate={props.selectedDate}
            onNextMonthClicked={props.onNextMonthClicked}
            onPreviousMonthClicked={props.onPreviousMonthClicked}
            onDateClicked={props.onDateChanged}
            options={{ highlightedRanges: [props.selectedRange] }}
          />
          <TimeSheetLabelWrapper>
            <TimeSheetLabelInsideWrapper>
              <FormattedMessage {... messages.notifications} />
            </TimeSheetLabelInsideWrapper>
          </TimeSheetLabelWrapper>
        </CalendarColumn>

        <Switch>
          <Route path={`${props.match.url}log`} component={LogHourForm} />
          <DayColumnsWrapper className="column">
            <AboveDaysArea>
            </AboveDaysArea>
            <DaysArea>
              { renderDays(props.selectedRange, props.history) }
            </DaysArea>
          </DayColumnsWrapper>
        </Switch>
      </ColumnsWrapper>
    </MainContainerWrapper>
  );
}

TimesheetPage.propTypes = {
  selectedDate: PropTypes.objectOf(Date).isRequired,
  selectedRange: PropTypes.arrayOf(Date).isRequired,
  onNextMonthClicked: PropTypes.func,
  onPreviousMonthClicked: PropTypes.func,
  onDateChanged: PropTypes.func,
  match: PropTypes.object,
  history: PropTypes.any,
};

const mapStateToProps = createStructuredSelector({
  selectedDate: makeSelectSelectedDate,
  selectedRange: makeSelectSelectedRange,
});

const withConnect = connect(mapStateToProps, { ...actions });

const withReducer = injectReducer({ key: 'timesheetpage', reducer });
const withSaga = injectSaga({ key: 'timesheetpage', saga });

export default compose(
  withReducer,
  withSaga,
  withConnect,
)(TimesheetPage);