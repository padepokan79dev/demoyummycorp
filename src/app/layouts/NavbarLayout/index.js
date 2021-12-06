import React from "react";
import { CaretDownOutlined } from '@ant-design/icons';
import Icon from '@ant-design/icons';
import { Layout, Row, Col, Avatar, Menu, Dropdown, Badge } from "antd";
import { withRouter } from "react-router-dom";
import Message from "../../../assets/message.png";
import Notification from "../../../assets/notification.png";
import IconAdmin from "../../../assets/admin-user.jpg";
import Logo from "../../../assets/logo2.png";
import { FSMServices } from "../../service";
import Cookies from 'js-cookie';

const { Header } = Layout;

const MessagePng = () => (
  <img src={Message} height="20px" alt="Message" />
);

const NotificationPng = () => (
  <img src={Notification} alt="Notification" height="20px" />
)

const MessageIcon = props => <Icon component={MessagePng} {...props} />
const NotificationIcon = props => <Icon component={NotificationPng} {...props} />

class HeaderLayout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      notification: [],
      totalData: 0
    };
  }

  doLogout() {
    Cookies.remove("LoginSession", { path: '' })
    Cookies.remove("userName", { path: '' })
    Cookies.remove("userId", { path: '' })
    Cookies.remove("lastModifiedOn", { path: '' })
    Cookies.remove("menu", { path: '' })
    Cookies.remove("roleId", { path: '' })
    sessionStorage.clear()
    this.props.history.push("/")
    this.props.logout()
  }

  notificationClick = (data) => {
    localStorage.setItem("notification", (data!=null) ? data.ticketCode : 'open' )
    if (this.props.location.pathname.includes('ticketing-list')){
      this.props.history.go()
    } else {
      this.props.history.push("/ticketing-list")
    }
  }

  getNotification(){
    let params = {
        filter: '8',
        keyword: '',
        page: 1,
        size: 9,
        orderBy: 'created_on,desc'
    }

    FSMServices.getTicketListFilter(params)
    .then(res => {
        var notification = res ? res.data.Data : []
        var totalData = res ? res.data.TotalData : 0

        this.setState({ notification, totalData})
    });
  }

  async componentDidMount(){
    await this.getNotification()
    setInterval(() => {
      var flag = localStorage.getItem("newNotification")
      if (flag && flag == "true"){
        this.getNotification()
        localStorage.setItem("newNotification", "false");
      }
    }, 1000);
  }

  render() {
    let menu = (
      <Menu className="menu-logout">
        <Menu.Item
          style={{ color: "#FFF" }}
          onClick={() => this.doLogout()}
        >
          Log out
        </Menu.Item>
      </Menu>
    );

    let notification = (
      <Menu className="menu-notification">
        {
          this.state.notification.map((data,index) => {
            return (
              <Menu.Item
                key={index}
                onClick={() => this.notificationClick(data)}
              >
                <b>#{data.ticketCode}</b><br></br>
                {data.ticketTitle}
              </Menu.Item>
            )
          })
        }
        {
          (this.state.totalData > 9) ?
            <Menu.Item
              style={{ textAlign: "right" }}
              onClick={() => this.notificationClick(null)}
            >
              <b>See all</b>
            </Menu.Item>
          : <></>
        }
      </Menu>
    )

    return (
      <React.Fragment>
        <Header className="header-fsm">
          <Row>
            <Col xs={3} sm={3} md={3} lg={3} className="area-header-title">
              <img src={Logo} alt="Tugasin" width="80"/>
            </Col>
            <Col xs={17} sm={17} md={19} lg={19} className="area-header-profile">
              <Dropdown className="test" overlay={menu} trigger={['click']}>
                <div style={{ cursor: 'pointer' }}>
                  <span className="name">{this.props.userName}</span>
                  <Avatar
                    size={32}
                    icon={<img src={IconAdmin} alt="admin user"/>}
                    style={{
                      marginRight: '10px',
                      background: 'rgba(0,0,0,0)'
                    }}
                  />
                  <CaretDownOutlined style={{ color: '#FFF', marginRight: 15 }} />
                </div>
              </Dropdown>
            </Col>
            <Col xs={2} sm={2} md={1} lg={1}>
              <Badge count={0}>
                <MessageIcon />
              </Badge>
            </Col>
            <Col xs={2} sm={2} md={1} lg={1}>
              <Dropdown className="test" overlay={notification} trigger={['click']}>
                <div style={{ cursor: 'pointer' }}>
                  <Badge count={(this.state.totalData > 9) ? '9+' : this.state.totalData }>
                    <NotificationIcon />
                  </Badge>
                </div>
              </Dropdown>
            </Col>
          </Row>
        </Header>
      </React.Fragment>
    );
  }
}

export default withRouter(HeaderLayout);
