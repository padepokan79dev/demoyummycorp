import React from 'react'
import { Typography, Tabs, notification } from 'antd'
import _debounce from 'lodash.debounce'
import MemberUser from './member-user'
import MemberWorker from './member-worker'
import Cookies from 'js-cookie'
import { FSMServices } from '../../../service'
import { GlobalFunction } from '../../../global/function';

let members = [];

class MemberOfTenant extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tab: '1',
      refresh: false,
      loading: false,
      superAdmin: (Cookies.get("roleId") == 1),
    }
  }

  componentDidMount() {
    this.setState({ tenantId: this.props.tenantId })
  }

  changeTab = key => {
    this.setState({ tab: key })
  }

  joinPage = (usersByPage) => {
    usersByPage.map(users => {
      users.map(id => {
        members.push(id)
      })
    })
    console.log('Join Page : ', members);
  }

  getListMemberUser = async (users) => {
    let listId = [];
    await users.map(user => {
      user.map(id => {
        listId.push(id)
      })
    })
    await GlobalFunction.getUnique(listId);
    this.onSaveMember(listId, 'user');
  }

  getListMemberWorker = async (workers) => {
    let listId = [];
    await workers.map(worker => {
      worker.map(id => {
        listId.push(id)
      })
    })
    await GlobalFunction.getUnique(listId);
    this.onSaveMember(listId, 'worker');
  }

  onSaveMember = async (listId, type) => {
    this.setState({ loading: true })
    console.log('List ID : ', listId);
    let listMember = [];
    listId.map(item => {
      listMember.push({
        tenantId: this.state.tenantId,
        userId: item
      })
    })

    if (type === 'worker' && listMember.length === 0){
      this.setState({ loading: false })
      return notification.error({
        placement: 'bottomRight',
        message: 'Error',
        description: 'Tenant must have min 1 worker'
      })
    }

    if (type === 'user' && listMember.length === 0 && this.state.superAdmin){
      this.setState({ loading: false })
      return notification.error({
        placement: 'bottomRight',
        message: 'Error',
        description: 'Tenant must have min 1 user'
      })
    }

    let data = {
      createdBy: Cookies.get('userId'),
      addMember: type,
      users: type === 'worker' && listMember.length === 0 ? [
        {
          "tenantId": this.state.tenantId,
          "userId": null
        }
      ] : type === 'user' && listMember.length === 0 ? [
        {
          "tenantId": this.state.tenantId,
          "userId": Cookies.get('userId')
        }
      ] : listMember
    }

    FSMServices.updateMemberOnTenant(data).then(res => {
      if (res && res.status && res.status === 200 && res.data.Status === 'OK') {
        notification.success({
          placement: 'bottomRight',
          message: 'Success',
          description: 'Update Member on Tenant Success'
        })
        this.setState({
          refresh: true,
          loading: false
        })
        this.props.closeButton()
      } else {
        this.setState({ loading: false })
        notification.error({
          placement: 'bottomRight',
          message: res.data && res.data.Status ? res.data.Status : 'Error',
          description:
            res &&
              res.data &&
              res.data.Message ?
              res.data.Message : 'Update Member on Tenant Failed'
        })
      }
    })
  }

  render() {
    var { loading } = this.state
    return (
      <div>
        <Typography.Title level={3}>
          {this.props.isDetail ? 'Detail Member' : 'Add Member'}
        </Typography.Title>
        <div className="card-container-member">
          <Tabs type="card" onChange={this.changeTab}>
            <Tabs.TabPane tab="User" key="1">
              {this.state.tab === '1' &&
                <MemberUser
                  {...this.props}
                  refresh={this.state.refresh}
                  setRefresh={(event) => this.setState({ refresh: event })}
                  closeButton={this.props.closeButton}
                  onSave={(event) => this.getListMemberUser(event)}
                  loading={loading}
                />
              }
            </Tabs.TabPane>
            <Tabs.TabPane tab="Worker" key="2">
              {this.state.tab === '2' &&
                <MemberWorker
                  {...this.props}
                  refresh={this.state.refresh}
                  setRefresh={(event) => this.setState({ refresh: event })}
                  closeButton={this.props.closeButton}
                  onSave={(event) => this.getListMemberWorker(event)}
                  loading={loading}
                />
              }
            </Tabs.TabPane>
          </Tabs>
        </div>
      </div>
    )
  }
}

export default MemberOfTenant;
