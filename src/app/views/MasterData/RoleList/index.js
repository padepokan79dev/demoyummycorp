import React from "react";
import { withRouter } from "react-router-dom";
import {
    Layout,
    Typography,
    Row,
    Col,
    Button,
    Input,
    Card,
    Space,
    notification,
    Table,
    Popconfirm
} from "antd";
import {
    PlusOutlined,
    SearchOutlined,
    CloseOutlined,
    EditFilled
} from '@ant-design/icons';
import ModalCreateEdit from './modal';
import { FSMServices } from "../../../service";
import _debounce from 'lodash.debounce';
import { GlobalFunction } from '../../../global/function';
import PermissionDenied from '../../../global/permissionDenied'
import Cookies from 'js-cookie'

const { Content } = Layout;
const { Title } = Typography;

class MasterDataRoleList extends React.Component {
    constructor(props) {
        super(props);
        document.title = this.props.name + " | FSM"

        this.state = {
            visibleCreate: false,
            visibleUpdate: false,
            sort: "created_on,desc",
            search: "",
            pagination: {
                current: 1,
                pageSize: 10,
            },
            userId: Cookies.get("userId"),
            loadingDelete: [],
            loadingEditRecord:[],
            loadingPrivilege: false,
            privilege: [],
            checkedAllPrivilege: false,
            accessRight: ''
        }
    }

    componentDidMount() {
        this.getRoleList(
            this.state.search,
            this.state.pagination.current - 1,
            this.state.pagination.pageSize,
            this.state.sort
        );
        this.getOptionListUserGroup();
        this.getPrivilege();
        this.setState({
          userId: this.props.userId
        });
        setTimeout(() => this.setState({accessRight: sessionStorage.getItem("accessRight")}),500);
    }

    getPrivilege = async () => {
      await FSMServices.getPrivilege().then( res => {
        this.setState({
          privilege: res.data.Data,
        });
      });
    }

    toggleModalCreate = async () => {
      if (!this.state.visibleCreate){
        this.setState({ loadingPrivilege: true })
        await this.getPrivilege()
        this.setState({
          checkedAllPrivilege: false,
          loadingPrivilege: false
        })
      }

        this.setState({
            visibleCreate: !this.state.visibleCreate,
        });
    }

    toggleModalUpdate = async record => {
      const loadingEditRecord = [];
      loadingEditRecord[record.roleId] = true;
      this.setState({ loadingEditRecord: loadingEditRecord });

      if (!this.state.visibleUpdate){
        this.setState({ loadingPrivilege: true });
        await this.getPrivilege()
        FSMServices.getRole(record.roleId).then( res => {
          var privilege = this.state.privilege
          var data = res.data.Data.privilege

          for (var i = 0; i < data.length; i++) {
            for (var j = 0; j < privilege.length; j++) {
              if (data[i].name == privilege[j].name){
                for (var k = 0; k < privilege[j].action.length; k++) {
                  if (data[i].action.name == privilege[j].action[k].name){
                    privilege[j].action[k].checked = true
                    break
                    break
                  }
                }
              }
            }
          }

          var allTrue = true;

          for (var i = 0; i < privilege.length; i++) {
            for (var j = 0; j < privilege[i].action.length; j++) {
              if (!privilege[i].action[j].checked) {
                allTrue =  false
                break;
                break;
              }
            }
          }

          this.setState({
            checkedAllPrivilege: allTrue,
            loadingPrivilege: false,
            privilege: privilege
          });
        });
      }

        loadingEditRecord[record.roleId] = false;
        this.setState({
            visibleUpdate: !this.state.visibleUpdate,
            roleDetail: record,
            loadingEditRecord: loadingEditRecord,
            record: record
        });
    }

    // get list api
    async getRoleList(search, page, size, sort) {
        this.setState({
            loading: true
        });
        let tempList = [];
        await FSMServices.getRoleList(search, page, size, sort).then( res => {
            tempList =
                res &&
                res.data &&
                res.data.Data ?
                res.data.Data : [];

            for (var i = 0; i < tempList.length; i++) {
              var stringPrevilege = ''
              if (tempList[i].rolePrivilege.length > 0){
                for (var j = 0; j < tempList[i].rolePrivilege.length; j++) {
                  stringPrevilege += (stringPrevilege=='') ? tempList[i].rolePrivilege[j] : ', ' + tempList[i].rolePrivilege[j]
                }
              }

              tempList[i].strPrevilege = stringPrevilege
            }

            this.setState({
                pagination: {
                    ...this.state.pagination,
                    total:
                        res &&
                        res.data &&
                        res.data.totalListRole ?
                        res.data.totalListRole : 0
                }
            });
        });
        this.setState({
            roleList: tempList.map(item => {
                return {
                    ...item,
                    key: item.roleId
                }
            }),
            loading: false
        });
    }

    searchHandler(e) {
        let key = e.target.value;
        this.processSearchRole(key);
    }

    processSearchRole = _debounce(key => {
        this.setState({
            search: GlobalFunction.searchEncode(key),
            pagination: {
                ...this.state.pagination,
                current: 1
            }
        }, () => {
            this.getRoleList(
                this.state.search,
                this.state.pagination.current - 1,
                this.state.pagination.pageSize,
                this.state.sort
            );
        });
    }, 500)

    handleTableChange = (pagination, filters, sorter) => {
        if (sorter.order === "ascend") {
            sorter.order = "asc";
        } else if (sorter.order === "descend") {
            sorter.order = "desc";
        }

        this.setState({
            sort: `${sorter.order ? `${sorter.columnKey},${sorter.order}` : 'created_on,desc'}`,
            pagination: pagination
        }, () => {
            this.getRoleList(
                this.state.search,
                this.state.pagination.current - 1,
                this.state.pagination.pageSize,
                this.state.sort
            );
        });
    };

    createRole = async data => {
        FSMServices.createRole(data)
        .then(res => {
            if (
                res &&
                res.data &&
                res.data.Status ?
                res.data.Status === "OK" : false
            ) {
                notification.success({
                    placement: 'bottomRight',
                    message: 'Success',
                    description:
                        res &&
                        res.data &&
                        res.data.Message ?
                        res.data.Message : "Create Role Success",
                });
                this.toggleModalCreate();
                this.getRoleList(
                    this.state.search,
                    this.state.pagination.current - 1,
                    this.state.pagination.pageSize,
                    this.state.sort
                );
            } else {
                notification.error({
                    placement: 'bottomRight',
                    message: 'Error',
                    description:
                        res &&
                        res.data &&
                        res.data.Message ?
                        res.data.Message : "Create Role Error",
                })
            }
        });
    }

    getPrivilegePost(){
      const { privilege } = this.state
      var detailAccess = []
      var detailRead = false
      for (var i = 0; i < privilege.length; i++) {
        for (var j = 0; j < privilege[i].action.length; j++) {
          if (privilege[i].action[j].checked){
            if(privilege[i].action[j].name == "Read"){
              detailRead = true
            }

            var dt = {
              name: privilege[i].name,
              accessRight: privilege[i].action[j].name
            }
            detailAccess.push(dt)
          }
        }
      }

      if (detailRead){
        return detailAccess
      } else {
        return null
      }
    }

    onCreate = async values => {
        const detailAccess = await this.getPrivilegePost()
        if (detailAccess == null) {
          return notification.error({
              placement: 'bottomRight',
              message: 'Error',
              description: `Please choose min 1 privilege access 'Read' `,
          })
        }

        this.setState({ loadingCreate: true });
        const data = {
            roleName: values.roleName,
            userGroupId: {
                userGroupId: 4
            },
            createdBy: this.state.userId,
            lastModifiedBy: this.state.userId,
            privilege: {
              detailAccess: detailAccess
            }
        }

        await this.createRole(data)
        this.setState({ loadingCreate: false });
    }

    editRole = async (roleId, data) => {
        FSMServices.editRole(roleId, data)
        .then(res => {
            if (
                res &&
                res.data &&
                res.data.Status ?
                res.data.Status === "OK" : false
            ) {
                notification.success({
                    placement: 'bottomRight',
                    message: 'Success',
                    description:
                        res &&
                        res.data &&
                        res.data.Message ?
                        res.data.Message : "Edit Role Success",
                });
                this.toggleModalUpdate(this.state.record);
                this.getRoleList(
                    this.state.search,
                    this.state.pagination.current - 1,
                    this.state.pagination.pageSize,
                    this.state.sort
                );
            } else {
                notification.error({
                    placement: 'bottomRight',
                    message: 'Error',
                    description:
                        res &&
                        res.data &&
                        res.data.Message ?
                        res.data.Message : "Edit Role Error"
                })
            }
        });
    }

    onEdit = async values => {
        const detailAccess = await this.getPrivilegePost()
        if (detailAccess == null) {
          return notification.error({
              placement: 'bottomRight',
              message: 'Error',
              description: `Please choose min 1 privilege access 'Read'`,
          })
        }

        this.setState({ loadingEdit: true });
        const roleId = this.state.roleDetail.roleId;
        const data = {
            roleName: values.roleName,
            userGroupId: {
                userGroupId: 4
            },
            lastModifiedBy: this.state.userId,
            privilege: {
              detailAccess: detailAccess
            }
        }
        await this.editRole(roleId, data);
        this.setState({ loadingEdit: false });
    }

    deleteRole = async (roleId, data) => {
        FSMServices.deleteRole(roleId, data)
        .then(res => {
            if (
                res &&
                res.data &&
                res.data.Status ?
                res.data.Status === "OK" : false
            ) {
                notification.success({
                    placement: 'bottomRight',
                    message: 'Success',
                    description:
                        res &&
                        res.data &&
                        res.data.Message ?
                        res.data.Message : "Delete Role Success",
                });
                this.getRoleList(
                    this.state.search,
                    this.state.pagination.current - 1,
                    this.state.pagination.pageSize,
                    this.state.sort
                );
            } else {
                notification.error({
                    placement: 'bottomRight',
                    message: 'Error',
                    description:
                        res &&
                        res.data &&
                        res.data.Message ?
                        res.data.Message : "Delete Role Error"
                })
            }
        });
    }

    onDelete = async record => {
        const loadingDelete = [];
        loadingDelete[record.roleId] = true;
        this.setState({ loadingDelete: loadingDelete });
        const roleId = record.key;
        const data = {
            userId: this.state.userId
        }
        await this.deleteRole(roleId, data)
        loadingDelete[record.roleId] = false;
        this.setState({ loadingDelete: loadingDelete });
    }

    getOptionListUserGroup = () => {
        FSMServices.getOptionListUserGroup()
        .then( res => {
            this.setState({
                listUserGroup:
                    res &&
                    res.data &&
                    res.data.Data ?
                    res.data.Data : []
            });
        })
    }

    handleChangePrivilege = (val, indexMenu, indexAction) => {
      var { checkedAllPrivilege, privilege } = this.state
      privilege[indexMenu].action[indexAction].checked = val.target.checked

      var allTrue = true;

      for (var i = 0; i < privilege.length; i++) {
        for (var j = 0; j < privilege[i].action.length; j++) {
          if (!privilege[i].action[j].checked) {
            allTrue =  false
            break;
            break;
          }
        }
      }

      checkedAllPrivilege = allTrue;

      this.setState({privilege, checkedAllPrivilege})
    }

    handlerChangePrivilegeAll = (val) => {
      var { checkedAllPrivilege, privilege } = this.state
      checkedAllPrivilege = val.target.checked

      for (var i = 0; i < privilege.length; i++) {
        for (var j = 0; j < privilege[i].action.length; j++) {
          privilege[i].action[j].checked = checkedAllPrivilege
        }
      }

      this.setState({checkedAllPrivilege, privilege})
    }

    render() {
        const {
            roleList,
            pagination,
            loading,
            visibleCreate,
            visibleUpdate,
            loadingCreate,
            loadingEdit,
            loadingEditRecord,
            roleDetail,
            loadingDelete,
            loadingPrivilege,
            listUserGroup,
            privilege,
            checkedAllPrivilege,
            accessRight
        } = this.state;
        const paginationCus = { ...pagination, showSizeChanger: false }
        const columns = [
            {
                width: 1,
                render: record => (
                    <Popconfirm
                        title="Are you sure?"
                        okText="Yes"
                        cancelText="No"
                        onConfirm={() => this.onDelete(record)}
                    >
                      { (accessRight.includes('Delete') && record.roleId != 1 && record.roleId != 2) ?
                        <Button
                            className="btn-delete"
                            type="danger"
                            icon={<CloseOutlined />}
                            size={'middle'}
                            loading={loadingDelete[record.key]}
                        />
                        :<></>
                      }
                    </Popconfirm>
                )
            },
            {
                title: 'Role ID',
                dataIndex: 'roleId',
                key: 'role_id',
                sorter: true
            },
            {
                title: 'Role Name',
                dataIndex: 'roleName',
                key: 'role_name',
                sorter: true
            },
            {
                width: 600,
                title: 'Privilege',
                dataIndex: 'strPrevilege',
                key: 'privilege',
                sorter: false
            },
            {
                width: 1,
                render: record => (
                  <div>
                    { (accessRight.includes('Update') && record.roleId != 1) ?
                      <Button
                          className="btn-edit"
                          icon={<EditFilled />}
                          size={'middle'}
                          onClick={() => this.toggleModalUpdate(record)}
                          loading={loadingEditRecord[record.key]}
                      />
                      :<></>
                    }
                  </div>
                )
            },
        ];
        return (
            <Content className="content">
              { (accessRight.includes('Read')) || accessRight == "" ?
                <div>
                  <Row
                      style={{
                          marginBottom: '15px'
                      }}
                  >
                      <Col md={12}>
                          <Space size={20}>
                              <Title
                                  level={2}
                                  style={{
                                      display: 'inline-block',
                                      margin: '0'
                                  }}
                              >
                                  Role List
                              </Title>
                              { (accessRight.includes('Create')) ?
                                <Button
                                    className="button-create"
                                    icon={<PlusOutlined />}
                                    type="primary"
                                    onClick={this.toggleModalCreate}
                                >
                                    CREATE
                                </Button>
                                :<></>
                              }
                              <ModalCreateEdit
                                  title="New Role"
                                  visible={visibleCreate}
                                  buttonCancel={this.toggleModalCreate}
                                  onFinish={this.onCreate}
                                  userGroup={listUserGroup}
                                  loading={loadingCreate}
                                  loadingPrivilege={loadingPrivilege}
                                  privilege={privilege}
                                  handleChangePrivilege={(val, indexMenu, indexAction) => this.handleChangePrivilege(val, indexMenu, indexAction)}
                                  checkedAllPrivilege={checkedAllPrivilege}
                                  handlerChangePrivilegeAll={(val) => this.handlerChangePrivilegeAll(val)}
                              />
                              <ModalCreateEdit
                                  title="Update Role"
                                  visible={visibleUpdate}
                                  buttonCancel={this.toggleModalUpdate}
                                  onFinish={this.onEdit}
                                  loading={loadingEdit}
                                  userGroup={listUserGroup}
                                  roleDetail={roleDetail}
                                  loadingPrivilege={loadingPrivilege}
                                  privilege={privilege}
                                  handleChangePrivilege={(val, indexMenu, indexAction) => this.handleChangePrivilege(val, indexMenu, indexAction)}
                                  checkedAllPrivilege={checkedAllPrivilege}
                                  handlerChangePrivilegeAll={(val) => this.handlerChangePrivilegeAll(val)}
                              />
                          </Space>
                      </Col>
                      <Col md={12} style={{ textAlign: 'right' }}>
                          <Input
                              className="input-search"
                              placeholder="Search.."
                              style={{
                                  width: '250px',
                                  maxWidth: '80%',
                                  marginRight: '10px'
                              }}
                              prefix={<SearchOutlined />}
                              onChange={(e) => this.searchHandler(e)}
                          />
                      </Col>
                  </Row>
                  <Row>
                      <Col span={24}>
                          <Card
                              bordered={false}
                              className="card-master-data"
                          >
                              <Table
                                  columns={columns}
                                  dataSource={roleList}
                                  pagination={paginationCus}
                                  loading={loading}
                                  onChange={this.handleTableChange}
                                  size="middle"
                              />
                          </Card>
                      </Col>
                  </Row>
                </div>
                :
                <PermissionDenied />
              }
            </Content>
        );
    }
}

export default withRouter(MasterDataRoleList);
