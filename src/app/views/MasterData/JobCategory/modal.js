import React from "react";
import { Modal, Typography, Tooltip, Form, Button, Input, Space, Row, Col, Select, Radio, Tag } from "antd";
import { PlusOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const FormCreateEdit = (props) => {

	const onFinishFailed = errorInfo => {
	}
	return (
		<Form
			onFinish={values => props.onFinish(values)}
			onFinishFailed={onFinishFailed}
			initialValues={
				props.dataEdit ?
				{
					jobCategoryId:  props.dataEdit.jobCategoryId,
					jobCategoryName:  props.dataEdit.jobCategoryName,
					jobCategoryTag: props.dataEdit.jobCategoryTag,
					jobCategoryDesc: props.dataEdit.jobCategoryDesc,
					jobClassId: props.dataEdit.jobClass.jobClassId,
					reportId: props.isReportEdit
				} : {
					reportId: props.isReportEdit
				}
			}
		>
			<Row gutter={20}>
				<Col span={24} className="input-hidden">
					<Form.Item
						name="jobCategoryId"
					>
						<Input type="hidden" />
					</Form.Item>
				</Col>
				<Col span={12}>
					<Text>Name</Text>
					<Form.Item
						name="jobCategoryName"
						rules={[{ required: true, message: 'Please input name!' }]}
					>
						<Input className="input-modal" maxLength="50" placeholder={"Input Job Category Name"}/>
					</Form.Item>
				</Col>
				<Col span={12}>
					<Text>Tag</Text>
					<Form.Item
						name="jobCategoryTag"
						rules={[{ required: true, message: 'Please input tag!' }]}
					>
						<Input className="input-modal" maxLength="125" placeholder={"Input Tag"}/>
					</Form.Item>
				</Col>
				<Col span={24}>
				<Text>Description</Text>
					<Form.Item
						name="jobCategoryDesc"
						rules={[{ required: true, message: 'Please input description!' }]}
					>
						<TextArea rows={4} className="input-modal" maxLength="225" placeholder={"Input Description"}/>
					</Form.Item>
				</Col>
			</Row>
			<Row gutter={20}>
				<Col span={12}>
					<Text>Class</Text>
					<Form.Item
						name="jobClassId"
						rules={[{ required: true, message: 'Please input class!' }]}
					>
							
						<Select
							className="select"
							placeholder="Select Job Class"
						>
						{
						props.jobClass ?
							props.jobClass.map( item => 
								(
									<Option key={item.jobClassId} value={item.jobClassId}>{item.jobClassName}</Option>
								)
							) :
							(
								<></>
							)
						}
						</Select>
					</Form.Item>
				</Col>
				<Col span={6}>
					<Text>Report</Text>
					<Form.Item
						className="formItem-custom"
						name="reportId"

					>
						<Radio.Group
							onChange={props.onReportChange}	
						>
							<Radio value={1}>Yes</Radio>
							<Radio value={2}>No</Radio>
						</Radio.Group>
					</Form.Item>
				</Col>
				{props.isReportEdit === 1 ? 
					(
						<Col span={6}>
							<Text style={{opacity: 0}}>-</Text>
							<Form.Item
								className="formItem-custom"
							>
								<Button
									type="primary"
									size={'small'}
									block
									style={{
										borderRadius: '5px'
									}}
									onClick={props.handleDetail}
								>
									Detail
								</Button>
							</Form.Item>
						</Col>
					)
					:
					(
						<></>
					)
				}
			</Row>
			<Row>
				<Col span={24}>
					<Form.Item
						style={{
							textAlign: 'right',
							marginTop: '50px'
						}}
					>
						<Space size={'small'}>
							<Button
								type="danger"
								size={'small'}
								style={{
										paddingLeft: '20px',
										paddingRight: '20px',
										borderRadius: '5px'
								}}
								onClick={props.buttonCancel}
							>
								Cancel
							</Button>
							<Button
								type="primary"
								htmlType="submit"
								size={'small'}
								style={{
										paddingLeft: '25px',
										paddingRight: '25px',
										borderRadius: '5px'
								}}
								loading={props.loading}
							>
								Save
							</Button>
						</Space>
					</Form.Item>
				</Col>
			</Row>
		</Form>
	)
}

const FormReportField = props => {
	const [form] = Form.useForm()
    if (props.visible === false) {
		form.resetFields();
		form.setFieldsValue({
			existingReport: 1
		})
     }
	const onFinishFailed = errorInfo => {

	}
	return (
		<Form
			form={form}
			onFinish={values => props.onReportFieldFinish(values)}
			onFinishFailed={onFinishFailed}
			initialValues={{ 
				existingReport: props.existingReport ? props.existingReport : 1,
				existingReportName: undefined,
			 }}
		>
			<Row gutter={20}>
				<Col span={24}>
					<Text>Existing Field Report</Text>
					<Form.Item
						className="formItem-custom"
						name="existingReport"

					>
						<Radio.Group
							onChange={(val) => props.onExistingChange(val.target.value)}
						>
							<Radio value={1}>Yes</Radio>
							<Radio value={2}>No</Radio>
						</Radio.Group>
					</Form.Item>
				</Col>
				<Col span={24}>
					<Text>Field Name</Text>
					<Form.Item
						noStyle
						shouldUpdate = {(prevVal, curVal) => prevVal.existingReport !== curVal.existingReport}
					>
						{() => {
							return (
								<Form.Item 
									shouldUpdate 
									name='existingReportName'
								>
									{props.existingReport === 2 ? 
										(
											<Input className="input-modal" maxLength="125" placeholder={"Input Field Report Name"}></Input>
										) : (
											<Select
												className="select"
												placeholder="Select Field Report"
											>
												{props.optionListExistingReport.map((arr, index) => {
													let value = [];
													arr.field.map(val => {
														value.push(val.fieldName)
													})
													return (<Option key={arr.jobCategoryId} value={index}>{value.join(" - ")}</Option>)
												})}
											</Select>
										)
									}
								</Form.Item>
							)
						}}
					</Form.Item>
				</Col>
				<Col span={24}>
					<Form.Item
						style={{
						textAlign: 'right',
						marginTop: '20px'
					}}
					>
						<Button
							type="danger"
							// size={'small'}
							style={{
								paddingLeft: '20px',
								paddingRight: '20px',
								borderRadius: '5px',
								marginRight: '15px'
							}}
							onClick={() => props.handleCancel('field')}
						>
							Cancel
						</Button>
						<Button 
							type="primary"
							// size={'small'}
							htmlType="submit"
							style={{
								paddingLeft: '25px',
								paddingRight: '25px',
								borderRadius: '5px',
								backgroundColor: '#27AE60',
								borderColor: '#27AE60'
							}}
						>
							OK
						</Button>
					</Form.Item>
				</Col>
			</Row>
		</Form>
	)
}

class ModalCreateEdit extends React.Component {
	formRef = React.createRef();
	formRef2 = React.createRef();
	formIntial = React.createRef()
	constructor(props) {
		super(props);
		this.state = {
			visibleExisting: false,
			visibleReportField: false,
			visibleOptionParent: false,
			visibleOptionParent2: false,
			nameField: [],
			tagRender: [],
			dataFrom: null,
			existingReport: 1,
			dataFildOption: [],
			parentList: [],
			reportOptionField: [],
		}
	}


	componentWillReceiveProps(nextProps) {
		// You don't have to do this check first, but it can help prevent an unneeded render
		if (nextProps.dataReport !== this.state.reportOptionField) {
		  this.setState({ reportOptionField: nextProps.dataReport });
		}
	}


	onReportFieldFinish = values => {
		console.log(values)
		let reportOptionField = [...this.state.reportOptionField]
		let nameField = [...this.state.nameField]
		var parentList = [];
		if (nameField.length > 0) {
			parentList = nameField[nameField.length - 1].optionList;
		}
		if (values.existingReportName !== undefined) {
			nameField.push({
				listNameField: values.existingReportName,
				existingReport: values.existingReport,
				optionList: [],
				parentOptionList: parentList
			})
		}

		if (values.existingReport === 2) {
			if (reportOptionField.length === 0) {				
				reportOptionField.push({
					fieldOption: [],
					fieldName: values.existingReportName,
					parentId: null
				});
			} else {			
				reportOptionField.push({
					fieldOption: [],
					fieldName: values.existingReportName,
					parentId: reportOptionField.length-1
				});
			}
		} else {
			let dataOptionListExistingReport = this.props.optionListExistingReport[values.existingReportName]["field"];
			let idFieldJobCategoryId = []
			dataOptionListExistingReport.map((val) => {
				idFieldJobCategoryId.push(val["fieldJobCategoryId"])
			})
			this.props.getReportByJobCategory(idFieldJobCategoryId).then(res => {
				let reportByJobCategory = res ? res.data.Data : []
				dataOptionListExistingReport.map((val) => {
					let tempFieldOption = []
					reportByJobCategory.map((jobCategory) => {
						if (jobCategory.fieldName == val.fieldName) {
							tempFieldOption.push({
								fieldOptionName : {
									fieldOptionName:jobCategory.fieldOptionName,
								},
								fieldOptionParentId:jobCategory.fieldOptionParentName,
							})
						}
					})
					if (reportOptionField.length === 0) {				
						reportOptionField.push({
							fieldOption: tempFieldOption,
							fieldName: val.fieldName,
							parentId: null
						});
					} else {			
						reportOptionField.push({
							fieldOption: tempFieldOption,
							fieldName: val.fieldName,
							parentId: reportOptionField.length-1
						});
					}
					this.setState({
						// nameField: nameField,
						// reportOptionField: reportOptionField,
						visibleReportField: false
					})
				})
			})
		}

		this.setState({
			// nameField: nameField,
			// reportOptionField: reportOptionField,
			visibleReportField: false
		})
	}

	onExistingChange = val => {
		this.setState({
			existingReport: val
		})
	}
	
	onReportChange = val => {
		this.props.setIsReport(val.target.value);
	}

	handleDetail = () => {
		this.setState({
			visibleExisting: true
		})
	}

	addMoreReport = () => {
		this.setState({
			visibleReportField: true
		})
  }
  
  onHandleSubmit = () =>{
    this.setState({
			visibleExisting: false
		})
		this.props.setDataReport(this.state.reportOptionField);
  }

	handleRemoveFieldName = (index) => {
		let { nameField } = this.state
		if (nameField.length > -1) {
			nameField.splice(index, 1);
		}
		this.setState({
			nameField: nameField
		})
	}

	handleRemoveReportOptionFieldNoChoice = (index) => {
		let {reportOptionField} = this.state;
		if (index === reportOptionField.length-1) {
			reportOptionField.pop()
		}
		this.setState({
			reportOptionField: reportOptionField
		})
	}

	handleParentOptionReportOptionFieldNoChoice = (values) => {
		let reportOptionField = [...this.state.reportOptionField];
		reportOptionField[values.dataFrom]["fieldOption"].push({
			fieldOptionName : {
				fieldOptionName:values.optionReportName,
			},
			fieldOptionParentId:values.parentName ? values.parentName : null,
		})
		this.setState({
			visibleOptionParent: false,
			visibleOptionParent2: false,
			reportOptionField: reportOptionField
		})
	}

	handleParentOption = values => {
		let { nameField } = this.state
		let tempData = nameField
		tempData.map((val, index) => {
			if (val.listNameField === values.dataFrom) {
				let tempOption = tempData[index].optionList
					tempOption.push({
						parent: values.parentName,
						optionReportName: values.optionReportName
					})
					tempData[index].optionList = tempOption
				}
				return tempData	
				
			})
		this.setState({
			visibleOptionParent: false,
			visibleOptionParent2: false,
			nameField: tempData
		})
	}

	handleOptionParentReportOptionFieldNoChoice = (index, val) => {
		if (val.parentId === null) {
			this.setState({
				visibleOptionParent2: true,
				dataFrom: index,
			}, () => {
				if (this.formRef2.current !== null) {
					this.formRef2.current.resetFields()
				}
			})
		} else {
			this.setState({
				visibleOptionParent: true,
				dataFrom: index,
			}, () => {
				if (this.formRef.current !== null) {
					this.formRef.current.resetFields()
				}
			})
		}
	}

	handleOptionParent = (val) => {
		if(this.state.nameField.length > 1){
			this.setState({
				visibleOptionParent: true,
				dataFrom: val.listNameField,
				existingReport: val.existingReport,
				parentList: val.parentOptionList
			}, () => {
				if (this.formRef.current !== null) {
					this.formRef.current.resetFields()
				}
			})
		}else{
			this.setState({
				visibleOptionParent2: true,
				dataFrom: val.listNameField,
				existingReport: val.existingReport,
				parentList: val.parentOptionList
			}, () => {
				if (this.formRef2.current !== null) {
					this.formRef2.current.resetFields()
				}
			})
		}
		
	}

	handleClose = (index, indexOption) => {
		let reportOptionField = [...this.state.reportOptionField];
		reportOptionField[index]["fieldOption"].splice(indexOption, 1)

		this.setState({
			reportOptionField: reportOptionField
		})
	}

	handleCancel = from => {
		if (!this.props.isUpdate) {
			if (from === 'initial') {
				this.props.setDataReport([]);
				this.onExistingChange(1)
				this.setState({
					visibleExisting: false,
					nameField: [],
					tagRender: [],
					dataFrom: null,
					existingReport: 1,
					dataFildOption: [],
					parentList: [],
				}, () => {
					if (this.formIntial.current !== null) {
						this.formIntial.current.resetFields()
					}
				})
			}else if(from === 'field') {
				this.onExistingChange(1)
				this.setState({
					visibleReportField: false,
					existingReport: 1,
				})
			}else {
				this.setState({
					visibleOptionParent: false,
					visibleOptionParent2: false,
				})
			}
		}else {
			if (from === 'initial') {
				this.setState({
					visibleExisting: false
				}, () => {
					if (this.formIntial.current !== null) {
						this.formIntial.current.resetFields()
					}
				})
			}else if(from === 'field') {
				this.onExistingChange(1)
				this.setState({
					visibleReportField: false,
					existingReport: 1,
				})
			}else {
				this.setState({
					visibleOptionParent: false,
					visibleOptionParent2: false,
				})
			}
		}
	}

	render() {
		const {
			visibleExisting,
			visibleOptionParent,
			visibleOptionParent2,
			visibleReportField,
			reportOptionField,
			// dataFildOption
		} = this.state
		
		return (
			<div>
				{
					this.props.title === "Update Job Category" || this.props.title === "New Job Category" ?
						<Modal
							visible={this.props.visible}
							className="form-modal"
							footer={null}
							closable={false}
							centered
							width={650}
						>
							<Title level={3}>
								{this.props.title}
							</Title>
							{
								this.props.visible ?
								(
									<FormCreateEdit
										isReportEdit={this.props.isReportEdit}
										buttonCancel={this.props.buttonCancel}
										onFinish={values => this.props.onFinish(values)}
										jobClass={this.props.jobClass}
										report={this.props.report}
										dataEdit={this.props.dataEdit}
										loading={this.props.loading}
										handleDetail={() => this.handleDetail()}
										onReportChange={val => this.onReportChange(val)}
										
									/>
								) : 
								(
									<></>
								)
							}
						</Modal>
					: {}
				}
				<Modal
					visible={visibleExisting}
					className="form-modal"
					width={600}
					footer={null}
					closable={false}
					centered
				>
					<Title level={3} style={{marginBottom: 0}}>Reporting</Title>
					<Form ref={this.formIntial}
          // form={form}
          // onFinish={values => props.onReportFieldFinish(values)}
          // onFinishFailed={onFinishFailed}
          // initialValues={{ 
          //   existingReport: props.existingReport,
          //   existingReportName: undefined
          //  }}
          >
            
						<Row gutter={8}>
							<Col span={24}>
								<Form.Item
									style={{
										textAlign: 'right',
										marginTop: '20px'
								}}
								>
										<Button 
											type="primary"
											// size={'small'}
											style={{
												paddingLeft: '25px',
												paddingRight: '25px',
												borderRadius: '5px'
											}}
											onClick={() => this.addMoreReport()}
										>
											Add More
										</Button>
								</Form.Item>
							</Col>
							{reportOptionField.map((val, index) => {
								return (<Col span={24}>
									<Form.Item>
										<Row gutter={8}>
											<Col span={19}>
												<Text>{val.fieldName} </Text>
												<Form.Item>
													<div style={{ border: '1px solid #d9d9d9', borderRadius: '20px', padding: '5px 15px'}}>	
														{val.fieldOption.length > 0 && val.fieldOption.map((valueOption, indexOption) => {
															const isToLong = valueOption.fieldOptionName.fieldOptionName.length > 15
															const tagElement = (
																<Tag
																	className='edit-tag'
																	key={valueOption.fieldOptionName.fieldOptionName}
																	closable={true}
																	onClose={() => this.handleClose(index, indexOption)}
																>
																	{isToLong ? `${valueOption.fieldOptionName.fieldOptionName.slice(0, 15)}...` : valueOption.fieldOptionName.fieldOptionName}
																</Tag>
															)
															return isToLong ? (
																<Tooltip title={valueOption.fieldOptionName.fieldOptionName} key={valueOption.fieldOptionName.fieldOptionName}> 
																	{tagElement}
																</Tooltip>
															): (
																tagElement
															)
														})}
															
														<Tag className="site-tag-plus" onClick={() => this.handleOptionParentReportOptionFieldNoChoice(index, val)}>
															<PlusOutlined /> New Option Report
														</Tag>
													</div>
												</Form.Item>
											</Col>
											<Col span={5}>
												<Text style={{color: 'white'}}>Button</Text>
												<Button type="primary" style={{borderRadius: '5px'}} danger block onClick={() => this.handleRemoveReportOptionFieldNoChoice(index)}>Remove</Button>
											</Col>
										</Row>
									</Form.Item>
								</Col>)
							})}
							{/* {nameField.map((val, index) => {
									return (
										<Col span={24} key={index + val}>
											<Form.Item>
												<Row gutter={8}>
													<Col span={19}>
														<Text>{val.listNameField} add </Text>
														<Form.Item
															// name={val}
														>	
															<div style={{ border: '1px solid #d9d9d9', borderRadius: '20px', padding: '5px 15px'}}>
																{val.optionList.length > 0 && val.optionList.map(valueOption => {
																	const isToLong = valueOption.optionReportName.length > 15
																	console.log('isToLong',isToLong)

																	const tagElement = (
																		<Tag
																			className='edit-tag'
																			key={valueOption.optionReportName}
																			closable={true}
																			onClose={() => this.handleClose(valueOption.optionReportName)}
																		>
																			{isToLong ? `${valueOption.optionReportName.slice(0, 15)}...` : valueOption.optionReportName} test
																		</Tag>
																	)
																	{console.log('New Option Report', valueOption.optionReportName)}
																	return isToLong ? (

																		<Tooltip title={valueOption.optionReportName} key={valueOption.optionReportName}> 
																			{tagElement}
																		</Tooltip>
																	): (
																		tagElement
																	)
																})}
																
																<Tag className="site-tag-plus" onClick={() => this.handleOptionParent(val)}>
																	<PlusOutlined /> New Option Report
																</Tag>
															</div>
														</Form.Item>
													</Col>
													<Col span={5}>
														{console.log('index',index)}
														<Text style={{color: 'white'}}>Button</Text>
														<Button type="primary" style={{borderRadius: '5px'}} danger block onClick={() => this.handleRemoveFieldName(index)}>Remove</Button>
													</Col>
												</Row>
											</Form.Item>
										</Col>
									)
								})} */}
							<Col span={24}>
								<Form.Item
									style={{
										textAlign: 'right',
										marginTop: '20px'
									}}
								>
									<Button
										type="danger"
										// size={'small'}
										style={{
											paddingLeft: '20px',
											paddingRight: '20px',
											borderRadius: '5px',
											marginRight: '15px'
										}}
										onClick={() => this.handleCancel('initial')}
									>
											Cancel
									</Button>
									<Button 
										type="primary"
										// size={'small'}
										style={{
										paddingLeft: '25px',
										paddingRight: '25px',
										borderRadius: '5px'
										}}
										onClick={() => this.onHandleSubmit()}
									>
										Submit
									</Button>
								</Form.Item>
							</Col>
						</Row>
					</Form>
				</Modal>
				<Modal 
					visible={visibleReportField}
					className="form-modal"
					footer={null}
					closable={false}
					centered
				>
					<Title level={3}>Field Report</Title>
					<FormReportField
						buttonCancel={this.props.buttonCancel}
						onReportFieldFinish={values => this.onReportFieldFinish(values)}
						existingReport={this.state.existingReport}
						// testexistingReport={this.state.optionListExistingReport}
						visible={visibleReportField}
						onExistingChange={val => this.onExistingChange(val)}
						optionListExistingReport={this.props.optionListExistingReport}
						handleCancel={from => this.handleCancel(from)}
					/>
				</Modal>
				<Modal
					visible={visibleOptionParent}
					className="form-modal"
					footer={null}
					closable={false}
					centered
				>
					<Title level={3}>Select Parent Option</Title>
					<Form 
						ref={this.formRef}
						onFinish={values => this.handleParentOptionReportOptionFieldNoChoice(values)}
						initialValues={{
							dataFrom: this.state.dataFrom
						}}
					>
						<Row gutter={8}>
						<Col span={24} className="input-hidden">
							<Form.Item
								name="dataFrom"
							>
								<Input type="hidden" />
							</Form.Item>
						</Col>
							<Col span={24}>
								<Text>Parent</Text>
								<Form.Item
									name="parentName"
									rules={[{ 
										required: true, 
										message: 'Please Select Parent Report!' 
									}]}
								>
									
									<Select
										className="select"
										placeholder="Select Parent Option Report"
									>			
									{
										this.state.reportOptionField[this.state.dataFrom] && this.state.reportOptionField[this.state.dataFrom]["parentId"] !== null ?
										this.state.reportOptionField[this.state.reportOptionField[this.state.dataFrom]["parentId"]]["fieldOption"].map(item => 
											(
												<Option key={item.fieldOptionName.fieldOptionName} value={item.fieldOptionName.fieldOptionName}>{item.fieldOptionName.fieldOptionName}</Option>
											)
										) :
										(
											<></>
										)
									}
									</Select>
								</Form.Item>
							</Col>
							<Col span={24}>
							<Text>Option Report</Text>
								<Form.Item
									name="optionReportName"
									rules={[{ 
										required: true, 
										message: 'Please Option Report Name!' 
									}]}
								>
									<Input className="input-modal" maxLength="125" placeholder={"Input Option Report"}/>
								</Form.Item>
							</Col>
							<Col span={24}>
								<Form.Item
									style={{
									textAlign: 'right',
									marginTop: '20px'
								}}
								>
									<Button
										type="danger"
										// size={'small'}
										style={{
											paddingLeft: '20px',
											paddingRight: '20px',
											borderRadius: '5px',
											marginRight: '15px'
										}}
										onClick={() => this.handleCancel('report')}
									>
											Cancel
									</Button>
									<Button 
										type="primary"
										// size={'small'}
										htmlType="submit"
										style={{
											paddingLeft: '25px',
											paddingRight: '25px',
											borderRadius: '5px',
											backgroundColor: '#27AE60',
											borderColor: '#27AE60'
										}}
									>
										OK
									</Button>
								</Form.Item>
							</Col>
						</Row>
					</Form>
				</Modal>

				{/* test */}
				<Modal
					visible={visibleOptionParent2}
					className="form-modal"
					footer={null}
					closable={false}
					centered
				>
					<Title level={3}>Select Parent Option</Title>
					<Form 
						ref={this.formRef2}
						onFinish={(values) => this.handleParentOptionReportOptionFieldNoChoice(values)}
						initialValues={{
							dataFrom: this.state.dataFrom
						}}
					>
						<Row gutter={8}>
						<Col span={24} className="input-hidden">
							<Form.Item
								name="dataFrom"
							>
								<Input type="hidden" />
							</Form.Item>
						</Col>
							<Col span={24}>
							<Text>Option Report</Text>
								<Form.Item
									name="optionReportName"
									rules={[{ 
										required: true, 
										message: 'Please Option Report Name!' 
									}]}
								>
									<Input className="input-modal" maxLength="125" placeholder={"Input Option Report"}/>
								</Form.Item>
							</Col>
							<Col span={24}>
								<Form.Item
									style={{
									textAlign: 'right',
									marginTop: '20px'
								}}
								>
									<Button
										type="danger"
										// size={'small'}
										style={{
											paddingLeft: '20px',
											paddingRight: '20px',
											borderRadius: '5px',
											marginRight: '15px'
										}}
										onClick={() => this.handleCancel('report')}
									>
											Cancel
									</Button>
									<Button 
										type="primary"
										// size={'small'}
										htmlType="submit"
										style={{
											paddingLeft: '25px',
											paddingRight: '25px',
											borderRadius: '5px',
											backgroundColor: '#27AE60',
											borderColor: '#27AE60'
										}}
									>
										OK
									</Button>
								</Form.Item>
							</Col>
						</Row>
					</Form>
				</Modal>
			</div>
		)
	}
}

export default ModalCreateEdit;