import React from "react";
import { withRouter } from "react-router-dom";
import { Layout, Typography, Row, Col, Card, Space, Avatar, Table, Input, Popconfirm, Button, notification } from "antd";
import { LeftOutlined, SearchOutlined } from '@ant-design/icons';
import _debounce from 'lodash.debounce'
import Modal from '../Dashboard/modal';
import { GlobalFunction } from '../../global/function';
import { FSMServices }  from "../../service";
import PermissionDenied from '../../global/permissionDenied'
import Cookies from 'js-cookie'

const { Content } = Layout;
const { Title, Text } = Typography;

class TicketOnCancel extends React.Component {
	constructor(props) {
		super(props);
		document.title = this.props.name + " | FSM"

		this.state = {
			visibelConfirmReportedOrder: false,
      loadingDetailConfirmReportedOrder: true,
      detailConfirmReportedOrder: [],
			visibleDetailTOC: false,
			detailTicketCancel: null,
			loadingDetailTicketCancel: false,
			search: "",
			pagination: {
				defaultCurrent: 1,
				pageSize: 10
			},
			orderBy: 'created_on,desc',
			ticketOnCancel:[],
			accessRight: '',
			dashboard: false,
			loadingReopen: [],
			userId: Cookies.get('userId')
		}
	}

	componentDidMount() {
		this.getAccessDashboard()
		this.getTicketOnCancelList('', 1, 10, 'created_on,desc');
		setTimeout(() => this.setState({accessRight: sessionStorage.getItem("accessRight")}),500);
	}

	getAccessDashboard(){
		var menu = JSON.parse(Cookies.get('menu'))
		for (var i = 0; i < menu.length; i++) {
			if (menu[i].name == 'Dashboard'){
				for (var j = 0; j < menu[i].accessRight.length; j++) {
					if (menu[i].accessRight[j] == 'Read'){
						this.setState({ dashboard: true })
						break
						break
					}
				}
			}
		}
	}

	// get list api
	async getTicketOnCancelList(search, page, size, orderBy) {
		this.setState({
			loading: true
		});
		await FSMServices.getTicketOnCancelList(search, page, size, orderBy).then( res => {
			let data =  res ? res.data.Data : [];
			this.setState({
				ticketOnCancel: data.map( item => {
					return {
						orderId: item.orderId,
						ticket_code: item.ticketCode,
						ticketId: item.ticketId,
						ticket_title: item.ticketTitle,
						company_name: item.companyName,
						reason: item.reason ? item.reason : "-",
						reference_ticket: (item.referenceTicket) ? item.referenceTicket : null,
						reference_ticket_code: (item.referenceTicket) ? item.referenceTicket.ticketCode : "-",
					}
				}),
				pagination: {
					current: page,
					total: res ? res.data.TotalData : 0
				}
			});
			this.setState({
				loading: false
			});
		});
	}


	handleModalDetail = e => {
		this.setState({
			visibleDetailTOC: !this.state.visibleDetailTOC,
			loadingDetailTicketCancel: true,
		},() => {
			FSMServices.getDetailTicketCancel(e).then(res => {
        this.setState({
            detailTicketCancel: res ? res.data.Data : null,
            loadingDetailTicketCancel: false
				});
			})
		})
	}

	handleModalDetailConfirmReported = key => {
    this.setState({
      visibelConfirmReportedOrder: !this.state.visibelConfirmReportedOrder,
      loadingDetailConfirmReportedOrder: true,
      }, () => {
      FSMServices.getDetailConfirmReportedOrder(key).then(res => {
        if( typeof res.data.Data.value === 'object'){
        let temp = res.data.Data
        this.setState({
          detailConfirmReportedOrder : res ? temp: [],
          loadingDetailConfirmReportedOrder: false
        })
        }else if(( typeof res.data.Data.value === 'string')){
          let temp = res.data.Data
          temp.value = JSON.parse(res.data.Data.value)
          this.setState({
          detailConfirmReportedOrder : res ? temp: [],
          loadingDetailConfirmReportedOrder: false
        })
        }else {
          let temp = res.data.Data
          temp=''
          this.setState({
          detailConfirmReportedOrder : res ? temp: [],
          loadingDetailConfirmReportedOrder: false
        })
        }
      })
    })
  }

	handleTableChange = (pagination, filters, sorter) => {
		let sorterField = ""
		if ( sorter.field === "company_name" ) {
			sorterField = "c.company_name";
		} else if ( sorter.field === "reason" ) {
			sorterField = "e.reason";
		} else {
			sorterField = sorter.field;
		}

		let orderBy = "created_on,desc";
		if (sorter.order === "ascend" ) {
			orderBy = `${sorterField},asc`;
		} else if (sorter.order === "descend") {
			orderBy = `${sorterField},desc`;
		}

		this.setState({
			orderBy: orderBy
		}, () => {
			this.getTicketOnCancelList(
				this.state.search,
				pagination.current,
				pagination.pageSize,
				orderBy
			);
		});
	};

	searchCancel = e => {
		let key = e.target.value
		this.processSearchCancel(GlobalFunction.searchEncode(key))

	}

	processSearchCancel = _debounce(key => {
		this.setState({
			search: key,
		},() => {
			this.getTicketOnCancelList(key, 1, 10,this.state.orderBy);
		})
  },500)

	handleModalDetailTOCClose = () => {
		this.setState({
			visibleDetailTOC: false
		})
	}

	handleModalDetailCROClose = () => {
    this.setState({
      visibelConfirmReportedOrder: false
    })
  }

	reopenTicket = async (record) => {
		let { loadingReopen, userId } = this.state;
		loadingReopen[record.orderId] = true;
		this.setState({ loadingReopen });

    var data = {
      createdBy: parseInt(userId),
    }

    await FSMServices.reopenTicket(record.ticketId, data)
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
						res.data.Message : "Reopen Ticket Success",
				});
			} else {
				notification.error({
					placement: 'bottomRight',
					message: 'Error',
					description:
						res &&
						res.data &&
						res.data.Message ?
						res.data.Message : "Reopen Ticket Error"
				});
			}
		})

		loadingReopen[record.orderId] = false;
		this.setState({ loadingReopen });
	}

	render() {
		const columns = [
			{
				title: 'Ticket ID',
				dataIndex: 'ticket_code',
				key: 'ticket_code',
				render: key => <Text style={{color: 'blue', cursor: 'pointer'}}>{key}</Text>,
				onCell: record => {
					return{
						onClick: () => {
							this.handleModalDetail(record.ticketId)
						}
					}
				},
				sorter: true
			},
			{
					title: 'Ref. Ticket ID',
					dataIndex: 'reference_ticket_code',
					key: 'reference_ticket_code',
					sorter: true,
					render: reference_ticket_code => <Text style={{color: (reference_ticket_code != "-" ) ? 'blue' : 'black', cursor: (reference_ticket_code != "-" ) ? 'pointer' : ''}} >{reference_ticket_code}</Text>,
					onCell: record => {
							return{
									onClick: () => {
											(record.reference_ticket.ticketStatus.toLowerCase() != "cancel") ? this.handleModalDetailConfirmReported(record.reference_ticket.orderId) : this.handleModalDetail(record.reference_ticket.ticketId)
									}
							}
					},
					align: 'center'
			},
			{
				title: 'Title',
				dataIndex: 'ticket_title',
				key: 'ticket_title',
				sorter: true
			},
			{
				title: 'Customer',
				dataIndex: 'company_name',
				key: 'c.company_name',
				sorter: true
			},
			{
				title: 'Reason',
				dataIndex: 'reason',
				key: 'e.reason',
				sorter: true
			},
			{
				title: '',
				render: record => (
					<div>
						{ (accessRight.includes('Re-Open')) ?
							<Popconfirm
								title="Are you sure?"
								okText="Yes"
								cancelText="No"
								onConfirm={ () => this.reopenTicket(record) }
							>
								<Button
								 className="button-confirm"
								 type="primary"
								 style={{backgroundColor:'green', borderColor:'green', borderRadius:"8px"}}
								 loading={this.state.loadingReopen[record.orderId]}>
									 Re-Open
								</Button>
							</Popconfirm>
							:<></>
					 }
					</div>
				)
			},
		];
		const { pagination, accessRight, dashboard } = this.state
		let paginationCus = { ...pagination, showSizeChanger: false}
		return (
			<Content className="content">
				{ accessRight.includes('Read') || accessRight == "" ?
					<div>
						<Row style={{	marginBottom: '15px' }}>
							<Col md={12}>
								<Space size={20}>
									{ (dashboard) ?
											<Avatar size="large" style={{ backgroundColor: 'red', background: '#27737D', cursor: 'pointer' }} icon={<LeftOutlined />} onClick={() => this.props.history.push('/dashboard') } />
										: <></>
									}

									<Title level={2} style={{display: 'inline-block',margin: '0'}}>
										Canceled Ticket List
									</Title>
									<Modal
                    title="Detail Confirm Reported Order"
                    visible={this.state.visibelConfirmReportedOrder}
                    buttonCancel={() => this.handleModalDetailCROClose()}
                    detailConfirmReportedOrder={this.state.detailConfirmReportedOrder ? this.state.detailConfirmReportedOrder : []}
                    loading={this.state.loadingDetailConfirmReportedOrder}
                    accessRight={accessRight}
                    confirmTicket={(record) => this.confirmTicket(record)}
                    loadingConfirm={this.state.loadingConfirm}
                  />
									<Modal
										title="Detail Ticket"
										visible={this.state.visibleDetailTOC}
										buttonCancel={() => this.handleModalDetailTOCClose()}
										detailTicketCancel={this.state.detailTicketCancel ? this.state.detailTicketCancel : []}
										loading={this.state.loadingDetailTicketCancel}
										accessRight={accessRight}
                    reopenTicket={(record) => this.reopenTicket(record)}
                    loadingReopen={this.state.loadingReopen}
									/>
								</Space>
							</Col>
							<Col md={5}>
								<>
								</>
							</Col>
							<Col md={7} style={{textAlign: 'right'}}>
		            <Input
		              className="input-search"
		              placeholder="Search.."
		              onChange={(e) => this.searchCancel(e)}
		              style={{
		                // width: '250px',
		                maxWidth: '90%'
		            }}
		              prefix={<SearchOutlined />}
		              />
		          </Col>
						</Row>
						<Row>
							<Col span={24}>
								<Card bordered={false} className="card">
									<Table
										columns={columns}
										dataSource={this.state.ticketOnCancel}
										pagination={paginationCus}
										rowKey={record => record.ticket_code}
										loading={this.state.loading}
										onChange={this.handleTableChange}
										size="middle"
									/>
								</Card>
							</Col>
						</Row>
					</div>
					: <PermissionDenied />
				}
			</Content>
		);
	}
}

export default withRouter(TicketOnCancel);
