// Import Dependencies
import React from "react";
import { Route, Redirect, HashRouter } from "react-router-dom";
import "./app/css/global.css";
import { Layout } from 'antd';
import Cookies from 'js-cookie'

// Import Layout
import HeaderLayout from "./app/layouts/HeaderLayout";
import NavbarLayout from "./app/layouts/NavbarLayout";
// import FooterLayout from "./app/layouts/FooterLayout";

// Import Screen Views
import Login from "./app/views/Login";
// import Register from "./app/views/Register";
import ForgotPassword from "./app/views/ForgotPassword";
import Dashboard from "./app/views/Dashboard";
import TicketingList from "./app/views/TicketingList";
import DispatchedList from "./app/views/DispatchedList";
import FinishOrder from "./app/views/FinishOrder";
import ConfirmReportedOrder from "./app/views/ConfirmReportedOrder";
import TicketOnCancel from "./app/views/TicketOnCancel";
import Monitoring from "./app/views/Monitoring";
import Workload from "./app/views/Workload";
import WorkloadCalendar from "./app/views/Workload/calendar.js";
import Schedule from "./app/views/Schedule";
import MasterDataJobList from "./app/views/MasterData/JobList";
import MasterDataJobClass from "./app/views/MasterData/JobClass";
import MasterDataJobCategory from "./app/views/MasterData/JobCategory";
import MasterDataSLA from "./app/views/MasterData/SLA";
import MasterDataUOM from "./app/views/MasterData/UOM";
import MasterDataWorkingTime from "./app/views/MasterData/WorkingTime";
import MasterDataWorker from "./app/views/MasterData/Worker";
import MasterDataUserList from "./app/views/MasterData/UserList";
import MasterDataRoleList from "./app/views/MasterData/RoleList";
import MasterDataCustomerList from "./app/views/MasterData/CustomerList";
import MasterDataCustomerBranchList from "./app/views/MasterData/CustomerBranchList";
import MasterDataCity from "./app/views/MasterData/City";
import MasterDataTenant from "./app/views/MasterData/Tenant";
import Import from "./app/views/Import";
import Export from "./app/views/Export";
// import MasterDataAction from "./app/views/MasterData/Action";
// import MasterDataFailure from "./app/views/MasterData/Failure";
// import MasterDataDiagnosis from "./app/views/MasterData/Diagnosis";
// import MasterDataReport from './app/views/MasterData/Report'
// import Report from "./app/views/Report";

function PrivateRoute({ ...props }) {
  if (
    Cookies.get("LoginSession") &&
    Cookies.get("userName") &&
    Cookies.get("userId")
  )
    return <Route {...props} />
  else {
    Cookies.remove("LoginSession", { path: '' })
    Cookies.remove("userName", { path: '' })
    Cookies.remove("userId", { path: '' })
    Cookies.remove("lastModifiedOn", { path: '' })
    Cookies.remove("menu", { path: '' })
    Cookies.remove("roleId", { path: '' })
    Cookies.remove("accessRight", { path: '' })
    sessionStorage.clear()
  }

  return <Redirect to="/" />
}

class Routes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLogin: false,
      userId: Cookies.get('userId') ? Cookies.get('userId') : null
    };
  }

  componentDidMount() {
    if (
      Cookies.get("LoginSession") &&
      Cookies.get("userName") &&
      Cookies.get("userId")
    ) {
      this.setState({
        isLogin: true
      })
    }
  }

  login = (userId) => {
    this.setState({
      isLogin: true,
      userId: userId
    });
  };

  logout = () => {
    this.setState({
      isLogin: false
    });
  };

  render() {
    const { isLogin } = this.state
    const userId = Cookies.get('userId') ? Cookies.get('userId') : this.state.userId
    return (
      <HashRouter>
        <React.Fragment>
          {isLogin ? <NavbarLayout userName={Cookies.get("userName")} logout={this.logout} /> : null}
          {isLogin ? <HeaderLayout /> : null}
          <Route exact path="/" render={props => <Login name="Login" userId={userId} login={(userIdData) => this.login(userIdData)} {...props} />} />
          {/*<Route path="/register" render={props => <Layout.Content className="site-layout-register"><Register name="Register" userId={userId} {...props} /></Layout.Content>} /> */}
          <Route path="/forgot-password" render={props => <ForgotPassword name="ForgotPassword" userId={userId} {...props} />} />
          <PrivateRoute path="/dashboard" render={props => <Dashboard name="Dashboard" userId={userId} {...props} />} />
          <PrivateRoute path="/ticketing-list" render={props => <TicketingList name="Ticketing List" userId={userId} {...props} />} />
          <PrivateRoute path="/dispatched-list" render={props => <DispatchedList name="Dispatched List" userId={userId} {...props} />} />
          <PrivateRoute path="/ticket-on-finish" render={props => <FinishOrder name="Ticket On Finish" userId={userId} {...props} />} />
          <PrivateRoute path="/confirm-reported-list" render={props => <ConfirmReportedOrder name="Confirm Reported List" userId={userId} {...props} />} />
          <PrivateRoute path="/ticket-on-cancel" render={props => <TicketOnCancel name="Ticket On Cancel" userId={userId} {...props} />} />
          <PrivateRoute path="/monitoring" render={props => <Monitoring name="Monitoring" userId={userId} {...props} />} />
          <PrivateRoute path="/workload" render={props => <Workload name="Workload Task" userId={userId} {...props} />} />
          <PrivateRoute path="/workload-calendar" render={props => <WorkloadCalendar name="Workload Calendar" userId={userId} {...props} />} />
          <PrivateRoute path="/schedule" render={props => <Schedule name="Schedule" userId={userId} {...props} />} />
          <PrivateRoute path="/master-data-job-list" render={props => <MasterDataJobList name="Master Data Job List" userId={userId} {...props} />} />
          <PrivateRoute path="/master-data-job-class" render={props => <MasterDataJobClass name="Master Data Job Class" userId={userId} {...props} />} />
          <PrivateRoute path="/master-data-job-category" render={props => <MasterDataJobCategory name="Master Data Job Category" userId={userId} {...props} />} />
          <PrivateRoute path="/master-data-sla" render={props => <MasterDataSLA name="Master Data SLA" userId={userId} {...props} />} />
          <PrivateRoute path="/master-data-uom" render={props => <MasterDataUOM name="Master Data UOM" userId={userId} {...props} />} />
          <PrivateRoute path="/master-data-working-time" render={props => <MasterDataWorkingTime name="Master Data Working Time" userId={userId} {...props} />} />
          <PrivateRoute path="/master-data-worker" render={props => <MasterDataWorker name="Master Data Worker" userId={userId} {...props} />} />
          <PrivateRoute path="/master-data-user-list" render={props => <MasterDataUserList name="Master Data User List" userId={userId} {...props} />} />
          <PrivateRoute path="/master-data-role-list" render={props => <MasterDataRoleList name="Master Data Role List" userId={userId} {...props} />} />
          <PrivateRoute path="/master-data-customer-list" render={props => <MasterDataCustomerList name="Master Data Customer List" userId={userId} {...props} />} />
          <PrivateRoute path="/master-data-customer-branch-list" render={props => <MasterDataCustomerBranchList name="Master Data Customer Brancch List" userId={userId} {...props} />} />
          <PrivateRoute path="/master-data-city" render={props => <MasterDataCity name="Master Data City" userId={userId} {...props} />} />
          <PrivateRoute path="/master-data-tenant" render={props => <MasterDataTenant name="Master Data Tenant" userId={userId} {...props} />} />
          <PrivateRoute path="/import" render={props => <Import name="Import" userId={userId} {...props} />} />
          <PrivateRoute path="/export" render={props => <Export name="Export" userId={userId} {...props} />} />
          {/*<PrivateRoute path="/master-data-report" render={props => <MasterDataReport name="Master Data Report" userId={userId} {...props} />} />
          <PrivateRoute path="/master-data-action" render={props => <MasterDataAction name="Master Data Action" userId={userId} {...props} />} />
          <PrivateRoute path="/master-data-failure" render={props => <MasterDataFailure name="Master Data Failure" userId={userId} {...props} />} />
          <PrivateRoute path="/master-data-diagnosis" render={props => <MasterDataDiagnosis name="Master Data Diagnosis" userId={userId} {...props} />} />
          <PrivateRoute path="/report" render={props => <Report name="Report" userId={userId} {...props} />} /> */}
          {/* {isLogin ? <FooterLayout /> : null} */}
        </React.Fragment>
      </HashRouter>
    );
  }
}

export default Routes;
