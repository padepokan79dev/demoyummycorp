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
	Table,
	Space,
	Popconfirm,
	notification
} from "antd";
import {
	PlusOutlined,
	SearchOutlined,
	CloseOutlined,
	EditFilled
} from '@ant-design/icons';
import Modal from './modal';
import { FSMServices } from '../../../service';
import _debounce from 'lodash.debounce';
import { GlobalFunction } from '../../../global/function';
import PermissionDenied from '../../../global/permissionDenied'
import Cookies from 'js-cookie'

const { Content } = Layout;
const { Title } = Typography;

class UserList extends React.Component {
	constructor(props) {
		super(props);
		document.title = this.props.name + " | FSM"
		this.state = {
			visibleCreate: false,
			visibleUpdate: false,
			sort: "created_on,desc",
			search: "",
			userId: '',
			pagination: {
				current: 1,
				pageSize: 10
			},
			loadingDelete: [],
			loadingRecord: [],
			currentPos: null,
			loadingOpenModalEdit: [],
			infoWindowVisible: false,
			mapCenter: null,
			tempCurrentPos: null,
			accessRight: '',
			tenantList: []
		}
	}

	componentDidMount() {
		this.getOptionListCity();
		this.getOptionListRoleUser();
		this.getOptionListTenant('');
		this.getOptionListUserIdentity();
		this.getUser(
			this.state.search,
			this.state.pagination.current - 1,
			this.state.pagination.pageSize,
			this.state.sort
		);
		this.setState({
			userIdAccount: this.props.userId
		})
		if (navigator.geolocation) {
			this.getCurrentPosition();
		}
		setTimeout(() => this.setState({ accessRight: sessionStorage.getItem("accessRight") }), 500);
	}

	getCurrentPosition() {
		navigator.geolocation.getCurrentPosition(position => {
			this.setState({
				currentPos: {
					lat: position.coords.latitude,
					lng: position.coords.longitude
				},
				mapCenter: {
					lat: position.coords.latitude,
					lng: position.coords.longitude
				},
				tempCurrentPos: {
					lat: position.coords.latitude,
					lng: position.coords.longitude
				}
			})
		});
	}

	handleModalCreate = e => {
		this.getCurrentPosition();
		this.setState({ visibleCreate: true });
	}

	handleCancelCreate = e => {
		this.getCurrentPosition();
		this.setState({ visibleCreate: false });
	};

	handleModalUpdate = async record => {
		let loading = [];
		loading[record.key] = true;
		this.setState({ loadingOpenModalEdit: loading });
		await this.getUserDetail(record.key);
		loading[record.key] = false;
		this.setState({ loadingOpenModalEdit: loading });
		this.setState(state => ({
			visibleUpdate: true,
			userId: record.key,
			mapCenter: {
				lat: state.userDetail ? state.userDetail.latitude : 0,
				lng: state.userDetail ? state.userDetail.longitude : 0
			},
			currentPos: {
				lat: state.userDetail ? state.userDetail.latitude : 0,
				lng: state.userDetail ? state.userDetail.longitude : 0
			},
			tempCurrentPos: {
				lat: state.userDetail ? state.userDetail.latitude : 0,
				lng: state.userDetail ? state.userDetail.longitude : 0
			}
		}));
	}

	handleCancelUpdate = e => {
		this.getCurrentPosition();
		this.setState({
			visibleUpdate: false,
			userDetail: null
		});
	};

	async getUser(search, page, size, sort) {
		this.setState({
			loading: true
		});
		let listTemp = [];
		await FSMServices.getUser(search, page, size, sort)
			.then(res => {
				listTemp =
					res &&
						res.data &&
						res.data.Data ?
						res.data.Data : [];
				this.setState({
					pagination: {
						...this.state.pagination,
						total:
							res &&
								res.data &&
								res.data.TotalData ?
								res.data.TotalData : []
					}
				});
			});
		this.setState({
			userList: listTemp.map(item => {
				return {
					...item,
					key: item.userId
				}
			}),
			loading: false
		});
	}

	getUserDetail = async userId => {
		await FSMServices.getUserDetail(userId)
			.then(res => {
				this.setState({
					userDetail:
						res &&
							res.data &&
							res.data.Data ?
							res.data.Data[0] : []
				})
			});
	}

	async getOptionListCity() {
		this.setState({ loadingCity: true })
		await FSMServices.searchCityList("").then(res => {
			this.setState({
				optionListCity:
					res &&
						res.data &&
						res.data.Data ?
						res.data.Data : []
			});
		});
		this.setState({ loadingCity: false })
	}

	async getOptionListTenant(search) {
		this.setState({ loadingTenant: true })
		await FSMServices.getTenantLOV(search).then(res => {
			this.setState({
				tenantList:
					res &&
						res.data &&
						res.data.items ?
						res.data.items : []
			});
		});
		this.setState({ loadingTenant: false })
	}

	searchCity = (key) => {
		this.processSearchCity(GlobalFunction.searchEncode(key))
	}

	processSearchCity = _debounce(key => {
		const { optionListCity } = this.state
		let data = null
		FSMServices.searchCityList(key).then(res => {
			data = res ? res.data.Data : optionListCity
			this.setState({
				optionListCity: data
			})
		})
	}, 500)

	searchTenant = (key) => {
		this.processSearchTenant(GlobalFunction.searchEncode(key))
	}

	processSearchTenant = _debounce(key => {
		const { tenantList } = this.state
		let data = null
		FSMServices.getTenantLOV(key).then(res => {
			data = res ? res.data.items : tenantList
			this.setState({
				tenantList: data
			})
		})
	}, 500)

	async getOptionListRoleUser() {
		this.setState({ loadingUserRole: true });
		await FSMServices.getUserRole("").then(res => {
			this.setState({
				optionListUserRole:
					res &&
						res.data &&
						res.data.Data ?
						res.data.Data : []
			});
		});
		this.setState({ loadingUserRole: false });
	}

	async getOptionListUserIdentity() {
		this.setState({ loadingUserIdentity: true });
		await FSMServices.getOptionListUserIdentity().then(res => {
			this.setState({
				optionListUserIdentity:
					res &&
						res.data &&
						res.data.items ?
						res.data.items : []
			});
		});
		this.setState({ loadingUserIdentity: false });
	}

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
			this.getUser(
				this.state.search,
				this.state.pagination.current - 1,
				this.state.pagination.pageSize,
				this.state.sort
			);
		});
	};

	searchHandler = (e) => {
		let key = e.target.value;
		this.processSearchUser(key);
	}

	processSearchUser = _debounce(key => {
		this.setState({
			search: GlobalFunction.searchEncode(key),
			pagination: {
				...this.state.pagination,
				current: 1
			}
		}, () => {
			this.getUser(
				this.state.search,
				this.state.pagination.current - 1,
				this.state.pagination.pageSize,
				this.state.sort
			);
		});
	}, 500)

	createUser = async data => {
		await FSMServices.createUser(data)
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
								res.data.Message : "Create User Success"
					})
					this.handleCancelCreate();
					this.getUser(
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
								res.data.Message : "Create User Error",
					});
				}
			});
	}

	onCreate = async values => {
		this.setState({ loadingCreate: true });
		const { currentPos } = this.state;
		let tenantTemp = [];
		values.tenant.length > 0 && values.tenant.map(item => {
			tenantTemp.push({ tenantId: item })
		})
		const data = {
			primaryAreaId: {
				cityId: values.primaryAreaId.toString()
			},
			roleId: {
				roleId: values.roleId.toString()
			},
			userName: values.userName,
			userPassword: values.userPassword,
			userAddress: values.userAddress,
			userAddressDetail: values.userAddressDetail,
			phone: values.phone,
			mobilePhone: values.mobilePhone,
			userEmail: values.userEmail,
			userIdentity: values.userIdentity,
			userIdentityNo: values.userIdentityNo,
			userGender: values.userGender,
			userImage: null,
			userLatitude: currentPos.lat,
			userLongatitude: currentPos.lng,
			userFullName: values.userFullName,
			createdBy: this.state.userIdAccount,
			lastModifiedBy: this.state.userIdAccount,
			tenant: tenantTemp
		}
		await this.createUser(data);
		this.setState({ loadingCreate: false });
	}

	updateUser = async (userId, data) => {
		await FSMServices.updateUser(userId, data).then(res => {
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
							res.data.Message : "Update User Success",
				})
				this.setState({
					visibleUpdate: false,
					userDetail: null,
				});
				this.getCurrentPosition();
				this.getUser(
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
							res.data.Message : "Update User Error",
				});
			}
		});
	}

	onUpdate = async values => {
		this.setState({ loadingUpdate: true });
		const { currentPos, userId } = this.state;
		let tenantTemp = [];
		values.tenant.length > 0 && values.tenant.map(item => {
			tenantTemp.push({ tenantId: item })
		})
		const data = {
			primaryAreaId: {
				cityId: values.primaryAreaId.toString()
			},
			roleId: {
				roleId: values.roleId.toString()
			},
			userPassword: values.userPassword,
			userAddress: values.userAddress,
			userAddressDetail: values.userAddressDetail,
			phone: values.phone,
			mobilePhone: values.mobilePhone,
			userEmail: values.userEmail,
			userIdentity: values.userIdentity,
			userIdentityNo: values.userIdentityNo,
			userGender: values.userGender,
			userImage: null,
			userLatitude: currentPos.lat,
			userLongatitude: currentPos.lng,
			userName: values.userName,
			userFullName: values.userFullName,
			lastModifiedBy: this.state.userIdAccount,
			tenant: tenantTemp
		}
		await this.updateUser(userId, data)
		this.setState({ loadingUpdate: false });
	}

	deleteUser = async (userId, data) => {
		await FSMServices.deleteUser(userId, data)
			.then(res => {
				if (
					res &&
						res.data &&
						res.data.Status ?
						res.data.Status === "Success!" : false
				) {
					notification.success({
						placement: 'bottomRight',
						message: 'Success',
						description:
							res &&
								res.data &&
								res.data.Message ?
								res.data.Message : "Delete User Success",
					});
					this.setState({ visibleUpdate: false });
					this.getUser(
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
								res.data.Message : "Delete User Error"
					});
				}
			})
	}

	onDelete = async record => {
		let loading = this.state.loadingDelete;
		loading[record.key] = true;
		this.setState({ loadingDelete: loading });
		const userId = record.key;
		const data = {
			lastModifiedBy: this.state.userIdAccount
		}
		await this.deleteUser(userId, data)
		loading[record.key] = false;
		this.setState({ loadingDelete: loading });
	}

	handleMaps = () => {
		this.setState({
			visibleMaps: true
		})
	}

	handleClickMaps = (e) => {
		const { latLng } = e;
		this.setState({
			currentPos: latLng === undefined ? e.position : latLng,
			currentPosUpdate: latLng === undefined ? e.position : latLng,
			infoWindowVisible: true,
			activeMarker: e
		});
	}

	handleClickOk = () => {
		this.setState(state => ({
			visibleMaps: false,
			visibleMapsUpdate: false,
			currentPos: state.tempCurrentPos,
			mapCenter: state.tempCurrentPos
		}))
	}

	onMarkerDragEnd = event => {
		const coords = {
			lat: event.latLng.lat(),
			lng: event.latLng.lng()
		}
		this.setState({
			tempCurrentPos: coords
		})
	}

	windowClosed = () => {
		this.setState({ infoWindowVisible: false })
	}

	onPlacesChanged = place => {
		let coords;
		place.map(res => {
			coords = {
				lat: res.geometry.location.lat(),
				lng: res.geometry.location.lng()
			}
			return null;
		})
		this.setState({
			tempCurrentPos: coords,
			mapCenter: coords
		})
	}

	onClickMap = event => {
		const coords = {
			lat: event.latLng.lat(),
			lng: event.latLng.lng()
		}
		this.setState({
			tempCurrentPos: coords
		})
	}

	onCancelMaps = event => {
		this.setState(state => ({
			visibleMaps: false,
			visibleMapsUpdate: false,
			tempCurrentPos: state.currentPos,
			mapCenter: {
				lat: state.currentPos.lat + 0.00001,
				lng: state.currentPos.lng + 0.00001
			}
		}))
	}

	render() {
		const {
			userList, visibleCreate, optionListCity,
			loadingCity, loadingCreate, loading,
			pagination, loadingUserRole, optionListUserRole,
			visibleUpdate, userDetail, loadingUpdate,
			optionListUserIdentity, loadingOpenModalEdit,
			mapCenter, tempCurrentPos, accessRight, tenantList, loadingTenant
		} = this.state;

		const paginationCus = { ...pagination, showSizeChanger: false };

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
						{ (accessRight.includes('Delete')) ?
							<Button
								className="btn-delete"
								type="danger"
								icon={<CloseOutlined />}
								size={'middle'}
								loading={this.state.loadingDelete[record.key]}
							/>
							: <></>
						}
					</Popconfirm>
				)
			},
			{
				title: 'User ID',
				dataIndex: 'userId',
				key: 'user_id',
				sorter: true,
			},
			{
				title: 'Email',
				dataIndex: 'userEmail',
				key: 'user_email',
				sorter: true,
			},
			{
				title: 'Username',
				dataIndex: 'userName',
				key: 'user_name',
				sorter: true,
			},
			{
				title: 'Role',
				dataIndex: 'roleName',
				key: 'role_name',
				sorter: true,
			},
			{
				title: 'Tenant',
				dataIndex: 'tenantDesc',
				key: 'tenantDesc',
				sorter: false,
			},
			{
				width: 1,
				render: record => (
					<div>
						{ (accessRight.includes('Update')) ?
							<Button
								className="btn-edit"
								icon={<EditFilled />}
								size={'middle'}
								onClick={() => this.handleModalUpdate(record)}
								loading={loadingOpenModalEdit[record.key]}
							/>
							: <></>
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
										User List
									</Title>
									{(accessRight.includes('Create')) ?
										<Button
											className="button-create"
											icon={<PlusOutlined />}
											type="primary"
											onClick={this.handleModalCreate}
										>
											CREATE
										</Button>
										: <></>
									}
									<Modal
										title="New User"
										visible={visibleCreate}
										buttonCancel={this.handleCancelCreate}
										onFinish={this.onCreate}
										city={optionListCity}
										loadingCity={loadingCity}
										userRole={optionListUserRole}
										listIdentity={optionListUserIdentity}
										laodingRole={loadingUserRole}
										loading={loadingCreate}
										mapsVisible={() => this.handleMaps()}
										mapView={this.state.visibleMaps}
										currentPos={this.state.currentPos}
										currentPosUpdate={this.state.currentPosUpdate}
										handleClickMaps={(e) => this.handleClickMaps(e)}
										handleClickOk={this.handleClickOk}
										onMarkerDragEnd={this.onMarkerDragEnd}
										infoWindowVisible={this.state.infoWindowVisible}
										windowClosed={this.windowClosed}
										onPlacesChanged={this.onPlacesChanged}
										onClickMap={this.onClickMap}
										mapCenter={mapCenter}
										onCancelMaps={this.onCancelMaps}
										tempCurrentPos={tempCurrentPos}
										searchCity={val => this.searchCity(val)}
										tenantList={tenantList}
										loadingTenant={loadingTenant}
										searchTenant={val => this.searchTenant(val)}
									/>
									<Modal
										title="Update User"
										visible={visibleUpdate}
										buttonCancel={this.handleCancelUpdate}
										onFinish={this.onUpdate}
										city={optionListCity}
										loadingCity={loadingCity}
										userRole={optionListUserRole}
										laodingRole={loadingUserRole}
										listIdentity={optionListUserIdentity}
										data={userDetail}
										loading={loadingUpdate}
										mapsVisible={() => this.handleMaps()}
										mapView={this.state.visibleMaps}
										currentPos={this.state.currentPos}
										currentPosUpdate={this.state.currentPosUpdate}
										handleClickMaps={(e) => this.handleClickMaps(e)}
										handleClickOk={this.handleClickOk}
										onMarkerDragEnd={this.onMarkerDragEnd}
										infoWindowVisible={this.state.infoWindowVisible}
										windowClosed={this.windowClosed}
										onPlacesChanged={this.onPlacesChanged}
										onClickMap={this.onClickMap}
										mapCenter={mapCenter}
										onCancelMaps={this.onCancelMaps}
										tempCurrentPos={tempCurrentPos}
										searchCity={val => this.searchCity(val)}
										tenantList={tenantList}
										loadingTenant={loadingTenant}
										searchTenant={val => this.searchTenant(val)}
									/>
								</Space>
							</Col>
							<Col md={12} style={{ textAlign: 'right' }}>
								<Input
									className="input-search"
									placeholder="Search.."
									onChange={e => this.searchHandler(e)}
									style={{
										width: '250px',
										maxWidth: '80%',
										marginRight: '10px'
									}}
									prefix={<SearchOutlined />}
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
										dataSource={userList}
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

export default withRouter(UserList);
