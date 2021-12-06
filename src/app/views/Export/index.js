import React from "react";
import { withRouter } from "react-router-dom";
import { Layout, Typography, Row, Col, Button, Card, Table, Space, Select, DatePicker } from "antd";
import FileSaver from 'file-saver';
import XLSX from 'xlsx';
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FSMServices } from "../../service";
import PermissionDenied from '../../global/permissionDenied'
import moment from 'moment'
import Cookies from 'js-cookie'

const { Option } = Select;
const { Content } = Layout;
const { Title } = Typography;
let startDateDefault = new Date()
startDateDefault.setHours(23,59,0,0)
let endDateDefault = new Date()
endDateDefault.setDate(endDateDefault.getDate() - 30 )
endDateDefault.setHours(0,0,0,0)
const dateFormat = 'YYYY-MM-DD'

class Export extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			visibleCard: false,
			visibleButton: false,
			visibleButonDownload: false,
			fileDownload: '',
			isDownloadCSV: false,
			filterStartDate: endDateDefault,
			filterEndDate: startDateDefault,
			filterWorker: null,
			filterStatus: null,
			filterCustomer: null,
			filterCity: null,
			dataFilter: [],
			dataDownload: [],
			optionWorker: [],
			optionCity: [],
			optionCompany: [],
			loading: true,
			accessRight: ''
		}
	}

	componentDidMount() {
		this.getWorkerList('')
		this.getCityList('')
		this.getCompanyList('')
		setTimeout(() => this.setState({accessRight: sessionStorage.getItem("accessRight")}),500);
	}

	getWorkerList = search => {
		FSMServices.searchWorkerList(search).then(res =>{
			this.setState({
				optionWorker: res ? res.data.Data : []
			})
		})
	}

	getCityList = search => {
		FSMServices.searchCityList(search).then(res => {
			this.setState({
				optionCity: res ? res.data.Data : []
			})
		})
	}

	getCompanyList = search => {
		console.log('key: ', search)
		FSMServices.searchCompanyList(search).then(res => {
			this.setState({
				optionCompany: res ? res.data.Data : []
			})
		})
	}

	handleShowCard = () => {
		const {
			filterStartDate,
			filterEndDate,
			filterWorker,
			filterStatus,
			filterCustomer,
			filterCity,
			dataFilter
		} = this.state
		let tempData = dataFilter
		let startDate = new Date(filterStartDate)
		let endDate = new Date(filterEndDate)
		const param = {
			companyId : filterCustomer,
			ticketStatusId : filterStatus,
			userId : filterWorker,
			cityId : filterCity,
			startDate : startDate.getTime(),
			endDate : endDate.getTime()
		}
		this.setState({
			loading: true
		})

		FSMServices.getFilterExport(param).then(res => {
			if (res.data.Status === 'OK') {
				tempData = res ? res.data.Data : []
				this.setState({
					dataDownload: tempData.map(item => {
						return {
							ticketCode: item.ticketCode,
							referenceTicketCode: (item.referenceTicketCode) ? item.referenceTicketCode : "-",
							ticketTitle: item.ticketTitle,
							companyName: item.companyName,
							workerName: item.workerName,
							startJob: item.startJob && item.startJob !== "-" ? moment(item.startJob).format('YYYY/MM/DD hh:mm:ss') : "-",
							endJob: item.endJob && item.endJob !== "-" ? moment(item.endJob).format('YYYY/MM/DD hh:mm:ss') : "-",
							cityName: item.cityName,
							ticketStatusId: item.ticketStatusId,
							filePath: (item.filePath) ? item.filePath : "",
						}
					}),
					dataFilter: tempData.map(item => {
						return {
							ticketCode: item.ticketCode,
							referenceTicketCode: (item.referenceTicketCode) ? item.referenceTicketCode : "-",
							ticketTitle: item.ticketTitle,
							companyName: item.companyName,
							workerName: item.workerName,
							startJob: item.startJob && item.startJob !== "-" ? moment(item.startJob).format('YYYY/MM/DD hh:mm:ss') : "-",
							endJob: item.endJob && item.endJob !== "-" ? moment(item.endJob).format('YYYY/MM/DD hh:mm:ss') : "-",
							cityName: item.cityName,
							ticketStatusId: item.ticketStatusId,
							filePath: (item.filePath) ? item.filePath.length > 10 ? `${item.filePath.substr(0,10)}...` : item.filePath : "",
						}
					}),
					loading: false
				})
			}
		})
		this.setState({
			visibleCard: true,

		});
	}

	onChangeCustomer = () => {
		this.setState({
			visibleButton: !this.state.visibleButton
		});
	}

	onChangeFilter = (name, val) => {
		if (name === 'Worker') {
			this.setState({
				filterWorker: val
			})
		}else if (name === 'status') {
			this.setState({
				filterStatus: val
			})
		}else if (name === 'customer') {
			this.setState({
				filterCustomer: val
			})
		}else {
			this.setState({
				filterCity: val
			})
		}
	}

	downloadFile = () => {
		const { fileDownload, dataDownload } = this.state
		const today = new Date()
		const name = 'Attachment Report ' + moment(today).format('YYYY/MM/DD')
		const head = [['Ticket ID', 'Ref. Ticket ID', 'Title', 'Customer', 'Worker', 'Start Date', 'End Date', 'City', 'Status', 'Attachment']]
		const dataConvert = this.convertToCSV(head[0].toString(), dataDownload)
		if (fileDownload === 'CSV') {
			const csvData = new Blob([dataConvert], { type: 'text/csv;charset=utf-8;' })
			FileSaver.saveAs(csvData, name +'.csv');
		}else if(fileDownload === 'EXCEL') {
			const filename = name+'.xlsx'
			const ws_name = 'Attachment_SHEET'
			const wb = XLSX.utils.book_new()
			const ws = XLSX.utils.aoa_to_sheet(head)
			XLSX.utils.sheet_add_json(ws, dataDownload, {
				header:['ticketCode', 'referenceTicketCode', 'ticketTitle', 'companyName', 'workerName' , 'startJob', 'endJob', 'cityName', 'ticketStatusId', 'filePath'],
				skipHeader:true,
				origin:-1
			})
			XLSX.utils.book_append_sheet(wb, ws, ws_name);
			XLSX.writeFile(wb, filename);
		}else {
			this.handlePdfExport(head, dataDownload, name)
		}
	}

	handlePdfExport = (head, dataJSON, name) => {
		const unit = "pt";
    const size = "A3"; // Use A1, A2, A3 or A4
    const orientation = "landscape"; // portrait or landscape

    const marginLeft = 40;
    const doc = new jsPDF(orientation, unit, size);

		doc.setFontSize(12);
		doc.setLineWidth(300)

    const title = name+" PDF";

    const dataPDF = dataJSON.map(elt=> [elt.ticketCode, elt.referenceTicketCode, elt.ticketTitle, elt.companyName, elt.workerName, elt.startJob, elt.endJob, elt.cityName, elt.ticketStatusId, elt.filePath]);

    let content = {
      startY: 50,
      head: head,
			body: dataPDF,
			columnStyles: {
				0: {cellWidth: 75},
				1: {cellWidth: 75},
				2: {cellWidth: 70},
				3: {cellWidth: 60},
				4: {cellWidth: 60},
				5: {cellWidth: 60},
				6: {cellWidth: 60},
				7: {cellWidth: 50},
				8: {cellWidth: 50},
				// 8: {cellWidth: 100},
			}
    };

    doc.text(title, marginLeft, 40);
    doc.autoTable(content);
    doc.save(name+".pdf")
	}
	onChangeFile = (val) => {
		this.setState({
			visibleButonDownload: true,
			fileDownload: val
		})
	}

	onDateChange = (date, dateString) => {
		this.setState({
			filterStartDate: dateString[0] + ' 00:00:00',
			filterEndDate: dateString[1] + ' 23:59:59'
		})
	}

	convertToCSV = (head, array) => {
		let str = head + '\r\n';

		for (let i = 0; i < array.length; i++) {
				let line = '';
				for (let index in array[i]) {
					if (line !== '') line += ','

					line += array[i][index];
				}
			str += line + '\r\n';
		}

		return str;
	}

	render() {
		const { optionWorker, optionCity, optionCompany, dataFilter, loading, accessRight } = this.state
		const columns = [
			{
				title: 'Ticket ID',
				dataIndex: 'ticketCode',
				key: 'ticketCode'
			},
			{
				title: 'Ref. Ticket ID',
				dataIndex: 'referenceTicketCode',
				key: 'referenceTicketCode'
			},
			{
				title: 'Title',
				dataIndex: 'ticketTitle',
				key: 'ticketTitle'
			},
			{
				title: 'Customer',
				dataIndex: 'companyName',
				key: 'companyName'
			},
			{
				title: 'Worker',
				dataIndex: 'workerName',
				key: 'workerName'
			},
			{
				title: 'Start Date',
				dataIndex: 'startJob',
				key: 'startJob'
			},
			{
				title: 'End Date',
				dataIndex: 'endJob',
				key: 'endJob'
			},
			{
				title: 'City',
				dataIndex: 'cityName',
				key: 'cityName'
			},
			{
				title: 'Status',
				dataIndex: 'ticketStatusId',
				key: 'ticketStatusId'
			},
			{
				title: 'Attachment',
				dataIndex: 'filePath',
				key: 'filePath'
			}
		];
		return (
			<Content className="content">
				{ accessRight.includes('Read') || accessRight == "" ?
					<div>
						<Row gutter={[20, 16]}>
							<Col md={24}>
								<Space size={20}>
									<Title
										level={2}
										style={{
											display: 'inline-block',
											marginBottom: '10px'
										}}
									>
										Data Export
									</Title>
								</Space>
							</Col>
							<Col md={8}>
								<Select className="select-dashboard" placeholder="Select data export" onChange={this.onChangeCustomer}>
									<Option value="Ticketing">Ticketing</Option>
								</Select>
							</Col>
						</Row>
						<Row>
							{ this.state.visibleButton ?
								<Col md={24}>
									<Row gutter={[8,16]}>
										<Col md={6}>

											<DatePicker.RangePicker
												onChange={(date, dateString) => this.onDateChange(date, dateString)}
												className='rangePicker-export'
												defaultValue={[moment(startDateDefault, dateFormat), moment(endDateDefault, dateFormat)]}
											/>
										</Col>
										<Col md={4}>
											<Select
												className="select-dashboard"
												placeholder="Worker"
												defaultValue='worker'
												showSearch
												onSearch={val => this.getWorkerList(val)}
												optionFilterProp="children"
												filterOption={false}
												onChange={ val => this.onChangeFilter('Worker', val)}
											>
												{optionWorker.length > 0 ?
													optionWorker.map( (item, index) => (
														<Option key={item.userId + 'worker' + index} value={item.userId}>{item.userName}</Option>
													)) :
												<></>
												}
											</Select>
										</Col>
										<Col md={4}>
											<Select className="select-dashboard" listHeight={288} placeholder="Status Ticket" defaultValue='lucy' onChange={val => this.onChangeFilter('status', val)}>
												<Option value="lucy">Status Filter</Option>
												<Option value="8" style={{color: 'green'}}>Open</Option>
												<Option value="9" style={{color: 'blue'}}>Dispatch</Option>
												<Option value="10" style={{color: 'green'}}>Inprogress</Option>
												<Option value="11" style={{color: 'orange'}}>Hold</Option>
												<Option value="12" style={{color: 'blue'}}>Finish</Option>
												<Option value="13" style={{color: 'red'}}>Cancel</Option>
												<Option value="30" style={{color: 'yellow'}}>Finish Reported</Option>
												<Option value="45" style={{color: '#d742f5'}}>Confirm Reported</Option>
											</Select>
										</Col>
										<Col md={4}>
											<Select
												className="select-dashboard"
												defaultValue='customer'
												placeholder="Customer"
												showSearch
												onSearch={val => this.getCompanyList(val)}
												optionFilterProp="children"
												filterOption={false}
												onChange={val => this.onChangeFilter('customer', val)}
											>
												{optionCompany.length > 0 ?
														optionCompany.map( (item, index) => (
															<Option key={item.companyId + 'customer' + index} value={item.companyId}>{item.companyName}</Option>
														)) :
													<></>
													}
											</Select>
										</Col>
										<Col md={4}>
											<Select
												className="select-dashboard"
												defaultValue='city'
												placeholder="City"
												showSearch
												onSearch={val => this.getCityList(val)}
												optionFilterProp="children"
												filterOption={false}
												onChange={val => this.onChangeFilter('city', val)}
											>
												{optionCity.length > 0 ?
														optionCity.map( (item, index) => (
															<Option key={item.cityId + 'city' + index} value={item.cityId}>{item.cityName}</Option>
														)) :
													<></>
													}
											</Select>
										</Col>
										<Col md={2}>
											<Button onClick={this.handleShowCard} style={{background:"#27AE60",color:"#FFF",borderRadius:"8px", width: '100%'}} >Filter</Button>
										</Col>
									</Row>
								</Col>
								:
								<></>
							}
						</Row>
						{ this.state.visibleCard ?
							<Row gutter={[8,8]}>
								<Col md={24}>
									<Row gutter={[20,16]}>
										<Col md={6}>
											<Select className="select-dashboard" placeholder="File Type" onChange={val=> this.onChangeFile(val)}>
												<Option value="CSV">CSV</Option>
												<Option value="EXCEL">EXCEL</Option>
												<Option value="PDF">PDF</Option>
											</Select>
										</Col>
										{this.state.visibleButonDownload ?
											<Col md={3}>
												<Button onClick={() => this.downloadFile()} style={{background:"#27AE60",color:"#FFF",borderRadius:"8px", width: '100%'}} >Download</Button>
											</Col>
											:
											<></>
										}
									</Row>
								</Col>
								<Col span={24}>
									<Card
										bordered={false}
										className="card-master-data"
									>
										<Table
											columns={columns}
											dataSource={dataFilter}
											rowKey={record => record.ticketCode}
											size="middle"
											loading={loading}
											style={{
												minWidth: "400px"
											}}
										/>
									</Card>
								</Col>
							</Row>
							:
							<></>
						}
					</div>
					:<PermissionDenied />
				}
			</Content>
		);
	}
}

export default withRouter(Export);
