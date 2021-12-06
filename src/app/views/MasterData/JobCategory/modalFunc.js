import React, { useEffect, useState } from "react";
import { 
  Modal, 
  Typography, 
  Tooltip, 
  Form, 
  Button, 
  Input, 
  Space, 
  Row, 
  Col, 
  Select, 
  Radio, 
  Tag,
  notification
} from "antd";
import { GlobalFunction } from '../../../global/function'

import { PlusOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const FormCreateEdit = (props) => {
	const [form] = Form.useForm()

	const onFinishFailed = errorInfo => {}

	const onValuesChange = (changedValues, allValues) => {
		const jobCategoryName = changedValues.jobCategoryName;
		if (jobCategoryName) {
			form.setFieldsValue({
				jobCategoryName: GlobalFunction.replaceSymbol(changedValues.jobCategoryName)
			});
		}
	}

	return (
		<Form
			form={form}
			onFinish={values => props.onFinish(values)}
			onFinishFailed={onFinishFailed}
			onValuesChange={onValuesChange}
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
    console.log(errorInfo)
  }

	const onValuesChange = (changedValues, allValues) => {
		const existingReportName = changedValues.existingReportName;
		if (existingReportName) {
			form.setFieldsValue({
				existingReportName: GlobalFunction.replaceSymbol(changedValues.existingReportName)
			});
		}
	}
  
  const handleExisting = data => {
    form.setFieldsValue({
      existingReportName: undefined
    })
    props.onExistingChange(data)
  }
	return (
		<Form 
			form={form}
			onFinish={values => props.onReportFieldFinish(values)}
			onFinishFailed={onFinishFailed}
			onValuesChange={onValuesChange}
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
							onChange={(val) => handleExisting(val.target.value)}
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
                  rules={[{ 
										required: true, 
										message: 'Please Select/Input Field Report Name!' 
									}]}
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

const modalReport = props => {
	const [formRef] = Form.useForm()
	const [formRef2] = Form.useForm()
  const [formIntial] = Form.useForm()
  
  const [visibleExisting, setVisibleExisting] = useState(false)
  const [visibleReportField, setVisibleReportField] = useState(false)
  const [visibleOptionParent, setVisibleOptionParent] = useState(false)
  const [visibleOptionParent2, setVisibleOptionParent2] = useState(false)
  // const [nameField, setNameField] = useState([])
  const [dataFrom, setDataFrom] = useState(null)
  const [existingReport, setExistingReport] = useState(1)
	const [reportOptionField, setReportOptionField] = useState([])
	
	useEffect(() => {
		if (props.visible === false) {
			props.setIsReport(2)
		}
	}, [props.visible])

  useEffect(() => {
    setReportOptionField(props.dataReport)
  }, [props.dataReport])

  useEffect(() => {
    formRef.resetFields()
  }, [visibleOptionParent])

  useEffect(() => {
    formRef2.resetFields()
  }, [visibleOptionParent2])

	const onReportFieldFinish = values => {
    // let parentList = [];
    // let tempNameField = [...nameField]
    let tempReportField = [...reportOptionField]
    let isSame = false
		// if (tempNameField.length > 0) {
		// 	parentList = tempNameField[tempNameField.length - 1].optionList;
		// }
		// if (values.existingReportName !== undefined) {
		// 	tempNameField.push({
		// 		listNameField: values.existingReportName,
		// 		existingReport: values.existingReport,
		// 		optionList: [],
		// 		parentOptionList: parentList
    //   })
		// }

		if (values.existingReport === 2) {
      reportOptionField.map(res=> {
        if (res.fieldName.toUpperCase() === values.existingReportName.toUpperCase()) {
          isSame = true
        }
      })
			if (tempReportField.length === 0) {				
				tempReportField.push({
					fieldOption: [],
					fieldName: values.existingReportName,
					parentId: null
				});
			} else {			
				tempReportField.push({
					fieldOption: [],
					fieldName: values.existingReportName,
					parentId: tempReportField.length-1
				});
      }
      if (isSame) {
        notification.error({
          placement: 'bottomRight',
          message: 'Error',
          description: 'Field Name Tidak Boleh Sama',
        });
      }else {
        // setNameField(tempNameField)
        setReportOptionField(tempReportField)
        setExistingReport(1)
        setVisibleReportField(false)
      }
		} else {
			let dataOptionListExistingReport = props.optionListExistingReport[values.existingReportName]["field"];
			let idFieldJobCategoryId = []
			dataOptionListExistingReport.map((val) => {
        reportOptionField.map(res=> {
          if (res.fieldName.toUpperCase() === val.fieldName.toUpperCase()) {
            isSame = true
          }
        })
				idFieldJobCategoryId.push(val["fieldJobCategoryId"])
			})
			props.getReportByJobCategory(idFieldJobCategoryId).then(res => {
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
					if (tempReportField.length === 0) {				
						tempReportField.push({
							fieldOption: tempFieldOption,
							fieldName: val.fieldName,
							parentId: null
						});
					} else {			
						tempReportField.push({
							fieldOption: tempFieldOption,
							fieldName: val.fieldName,
							parentId: tempReportField.length-1
						});
          }
        })
        
        if (isSame) {
          notification.error({
            placement: 'bottomRight',
            message: 'Error',
            description: 'Field Name Tidak Boleh Sama',
          });
        }else {
          // setNameField(tempNameField)
          setExistingReport(1)
          setReportOptionField(tempReportField)
          setVisibleReportField(false)
        }
			})
    }
	}

	const onExistingChange = val => {
    setExistingReport(val)
	}
	
	const onReportChange = val => {
		props.setIsReport(val.target.value);
	}

	const handleDetail = () => {
		setVisibleExisting(true)
	}

	const addMoreReport = () => {
    setVisibleReportField(true)
  }
  
	const onHandleSubmit = () => {
    setVisibleExisting(false)
		props.setDataReport(reportOptionField);
  }

	// const handleRemoveFieldName = (index) => {
	// 	let { nameField } = state
	// 	if (nameField.length > -1) {
	// 		nameField.splice(index, 1);
	// 	}
	// 	setState({
	// 		nameField: nameField
	// 	})
	// }

	const handleRemoveReportOptionFieldNoChoice = (index) => {
		let tempField = [...reportOptionField]
		if (index === tempField.length-1) {
			tempField.pop()
    }
    setReportOptionField(tempField)
	}

	const handleParentOptionReportOptionFieldNoChoice = (values) => {
    let isSame = false
    let tempField = [...reportOptionField];
    reportOptionField[values.dataFrom]["fieldOption"].map(res => {
      if (res.fieldOptionParentId === null || res.fieldOptionParentId.toUpperCase() === values.parentName.toUpperCase()) {
        if (res.fieldOptionName.fieldOptionName.toUpperCase() === values.optionReportName.toUpperCase()) {
          isSame = true
        }
      }
    })
    if (isSame) {
      notification.error({
        placement: 'bottomRight',
        message: 'Error',
        description: 'Option Report Tidak Boleh Sama',
      });
    }else {
      tempField[values.dataFrom]["fieldOption"].push({
        fieldOptionName : {
          fieldOptionName: values.optionReportName,
        },
        fieldOptionParentId:values.parentName ? values.parentName : null,
      })
      setVisibleOptionParent(false)
      setVisibleOptionParent2(false)
      setReportOptionField(tempField)
    }
	}

	// const handleParentOption = values => {
	// 	let { nameField } = state
	// 	let tempData = nameField
	// 	tempData.map((val, index) => {
	// 		if (val.listNameField === values.dataFrom) {
	// 			let tempOption = tempData[index].optionList
	// 				tempOption.push({
	// 					parent: values.parentName,
	// 					optionReportName: values.optionReportName
	// 				})
	// 				tempData[index].optionList = tempOption
	// 			}
	// 			return tempData	
				
	// 		})
	// 	setState({
			// 
	// 		visibleOptionParent: false,
	// 		visibleOptionParent2: false,
	// 		nameField: tempData
	// 	})
	// }

	const handleOptionParentReportOptionFieldNoChoice = (index, val) => {
		if (val.parentId === null) {
      setDataFrom(index)
      setVisibleOptionParent2(true)
		} else {
      setDataFrom(index)
      setVisibleOptionParent(true)
		}
	}

	// const handleOptionParent = (val) => {
	// 	if(nameField.length > 1){
	// 		setState({
	// 			
	// 			visibleOptionParent: true,
	// 			dataFrom: val.listNameField,
	// 			existingReport: val.existingReport,
	// 			parentList: val.parentOptionList
	// 		}, () => {
	// 			formRef.current.resetFields()
	// 		})
	// 	}else{
	// 		setState({
	// 		
	// 			visibleOptionParent2: true,
	// 			dataFrom: val.listNameField,
	// 			existingReport: val.existingReport,
	// 			parentList: val.parentOptionList
	// 		}, () => {
	// 			formRef2.resetFields()
	// 		})
	// 	}	
	// }

	const handleClose = (index, indexOption) => {
		let tempField = [...reportOptionField];
		tempField[index]["fieldOption"].splice(indexOption, 1)
    setReportOptionField(tempField)
	}

	const handleCancel = from => {
		if (!props.isUpdate) {
			if (from === 'initial') {
				props.setDataReport([]);
        onExistingChange(1)
        setVisibleExisting(false)
        setDataFrom(null)
        setExistingReport(1)
        formIntial.resetFields()
			}else if(from === 'field') {
        onExistingChange(1)
        setVisibleReportField(false)
        setExistingReport(1)
			}else {
        setVisibleOptionParent(false)
        setVisibleOptionParent2(false)
			}
		}else {
			if (from === 'initial') {
        setVisibleExisting(false)
        setReportOptionField(props.dataReport)
        formIntial.resetFields()
			}else if(from === 'field') {
        onExistingChange(1)
        setVisibleReportField(false)
        setExistingReport(1)
			}else {
        setVisibleOptionParent(false)
        setVisibleOptionParent2(false)
        setDataFrom(null)
			}
		}
	}

		return (
			<div>
				{
					props.title === "Update Job Category" || props.title === "New Job Category" ?
						<Modal
							visible={props.visible}
							className="form-modal"
							footer={null}
							closable={false}
							centered
							width={650}
						>
							<Title level={3}>
								{props.title}
							</Title>
							{props.visible ? 
							
								<FormCreateEdit
									isReportEdit={props.isReportEdit}
									buttonCancel={props.buttonCancel}
									visible={props.visible}
									onFinish={values => props.onFinish(values)}
									jobClass={props.jobClass}
									report={props.report}
									dataEdit={props.dataEdit}
									loading={props.loading}
									handleDetail={() => handleDetail()}
									onReportChange={val => onReportChange(val)}
								/>
							:
								<></>
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
          <Form 
            form={formIntial}
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
											onClick={() => addMoreReport()}
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
																	onClose={() => handleClose(index, indexOption)}
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
															
														<Tag className="site-tag-plus" onClick={() => handleOptionParentReportOptionFieldNoChoice(index, val)}>
															<PlusOutlined /> New Option Report
														</Tag>
													</div>
												</Form.Item>
											</Col>
											<Col span={5}>
												<Text style={{color: 'white'}}>Button</Text>
												<Button type="primary" style={{borderRadius: '5px'}} danger block onClick={() => handleRemoveReportOptionFieldNoChoice(index)}>Remove</Button>
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
																			onClose={() => handleClose(valueOption.optionReportName)}
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
																
																<Tag className="site-tag-plus" onClick={() => handleOptionParent(val)}>
																	<PlusOutlined /> New Option Report
																</Tag>
															</div>
														</Form.Item>
													</Col>
													<Col span={5}>
														{console.log('index',index)}
														<Text style={{color: 'white'}}>Button</Text>
														<Button type="primary" style={{borderRadius: '5px'}} danger block onClick={() => handleRemoveFieldName(index)}>Remove</Button>
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
										onClick={() => handleCancel('initial')}
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
										onClick={() => onHandleSubmit()}
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
						buttonCancel={props.buttonCancel}
						onReportFieldFinish={values => onReportFieldFinish(values)}
						existingReport={existingReport}
						// testexistingReport={optionListExistingReport}
						visible={visibleReportField}
						onExistingChange={val => onExistingChange(val)}
						optionListExistingReport={props.optionListExistingReport}
						handleCancel={from => handleCancel(from)}
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
						form={formRef}
						onFinish={values => handleParentOptionReportOptionFieldNoChoice(values)}
						initialValues={{
							dataFrom: dataFrom
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
										reportOptionField[dataFrom] && reportOptionField[dataFrom]["parentId"] !== null ?
										reportOptionField[reportOptionField[dataFrom]["parentId"]]["fieldOption"].map(item => 
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
										onClick={() => handleCancel('report')}
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
						form={formRef2}
						onFinish={(values) => handleParentOptionReportOptionFieldNoChoice(values)}
						initialValues={{
							dataFrom: dataFrom
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
										onClick={() => handleCancel('report')}
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

export const ModalCreateEdit = modalReport;