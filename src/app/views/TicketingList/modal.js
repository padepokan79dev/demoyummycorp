import React, { useState } from "react";
import {
    Modal,
    Typography,
    Form,
    Spin,
    Button,
    Input,
    Space,
    Row,
    Col,
    Select,
    message,
    Table,
    Tag,
    Switch
} from "antd";
// import moment from 'moment';
import { UploadOutlined } from '@ant-design/icons';
import { FSMServices } from "../../service";

const { Title, Text } = Typography;
const { TextArea } = Input;

const { Option } = Select;

const FormCreateEdit = (props) => {

    // State
    const [loadingUpload, setLoadingUpload] = useState(false);
    const [fileName, setFileName] = useState(null);
    const [fileNameRandom, setFileNameRandom] = useState("");
    const [filePath, setFilePath] = useState(null);

    // Method
    const onFinishFailed = errorInfo => {
    }

    const [form] = Form.useForm();

    const generateRandomFileName = () => {
        return Math.random().toString(36).substr(2, 9);
    }

    const fileInput = React.createRef();

    const openFileBrowser = () => {
        fileInput.current.click();
    }

    const handleBranchChange = (branchId) => {
        let tempSla = {
            slaId: ''
        }
        let tempPic = {
            picId: ''
        }
        props.slaType.map(itemSla => {
            if (itemSla.branchId === branchId) {
                tempSla.slaId = itemSla.slaId
            }
            return tempSla
        })
        props.pic.map(itemPic => {
            if (itemPic.branchId === branchId) {
                tempPic.picId = itemPic.picId
            }
            return tempPic
        })
        let temp = {
            slaId: tempSla.slaId,
            picId: tempPic.picId
        }
        form.setFieldsValue(temp)

    }

    const uploadAssignmentLetter = (data, fileNameParam) => {
        setLoadingUpload(true);
        FSMServices.uploadAssignmentLetter(data).then(res => {
            if (res && res.status ? res.status === 200 : false) {
                message.success('Upload success');
                var filePathSplit = res.data.filePath.split("/")
                var fileName = filePathSplit[filePathSplit.length - 1]
                setFileNameRandom(fileName);
                setFilePath(res && res.data ? res.data.filePath : "");
            } else {
                message.error("Upload failed");
            }
            setLoadingUpload(false);
        });
    }

    const fileHandler = (event) => {
        if (event.target.files.length) {
            const file = event.target.files[0];
            const fileNameValue = file.name;
            const fileExtension = fileNameValue.slice(fileNameValue.lastIndexOf('.') + 1);

            setFileName(fileNameValue);

            const randomNameFile = `Assignment letter ${generateRandomFileName()}.${fileExtension}`;

            const newFile = new File(
                [file],
                randomNameFile,
                { type: file.type }
            );

            setFileNameRandom(newFile.name);

            const formData = new FormData();
            formData.append("file", newFile);
            uploadAssignmentLetter(formData, newFile.name);
        }
    }

    const handleValueChange = (valChange, allValues) => {
        let temp = []
        if (valChange.length > 0) {
            if (valChange[0].name[0] === "companyId") {
                temp = {
                    branchId: undefined,
                    slaId: undefined,
                    picId: undefined
                }
                form.setFieldsValue(temp)
            } else if (valChange[0].name[0] === "jobClassId") {
                temp = {
                    jobCategoryId: undefined,
                    jobId: undefined
                }
                form.setFieldsValue(temp)
            } else if (valChange[0].name[0] === "jobCategoryId") {
                temp = {
                    jobId: undefined
                }
                form.setFieldsValue(temp)
            }

        }
    }

    return (
        <Form
            form={form}
            onFinish={values => props.onFinish(values, fileNameRandom, filePath)}
            onFinishFailed={onFinishFailed}
            onFieldsChange={(valChange, allValues) => handleValueChange(valChange, allValues)}
            initialValues={
                props.dataEdit ?
                    {
                        ticketTitle: props.dataEdit.ticketTitle,
                        companyId: props.dataEdit.companyId,
                        branchId: props.dataEdit.branchId,
                        slaId: props.dataEdit.slaId,
                        picId: props.dataEdit.picId,
                        categoryId: props.dataEdit.categoryId,
                        ticketDurationTime: props.dataEdit.ticketDurationTime,
                        // jobClassId: props.dataEdit.jobClassId,
                        // jobCategoryId: props.dataEdit.jobCategoryId,
                        jobId: props.dataEdit.jobId,
                        description: props.dataEdit.ticketDescription,
                        priorityId: props.dataEdit.priorityId,
                        reportId: props.dataEdit.reportId,
                        geofencing: props.dataEdit.geofencing,
                        refTicketCode: props.dataEdit.referenceTicketCode
                    }
                    :
                    // Add geofencing defaultValue
                    {
                        geofencing: true
                    }}
        >
            <Row gutter={20}>
                <Col span={24}>
                    <Text>Title</Text>
                    <Form.Item
                        name="ticketTitle"
                        rules={[
                            {
                                required: true,
                                message: 'Please input Title!'
                            }
                        ]}
                    >
                        <Input
                            className="input-modal"
                            maxLength={125}
                            placeholder="Input title" />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Text>Customer</Text>
                    <Form.Item
                        name="companyId"
                        rules={[{ required: true, message: 'Please input Customer!' }]}
                    >
                        <Select
                            className="select"
                            placeholder="Select customer"
                            disabled={props.isEdit}
                            onChange={e => props.onChangeCustomer(e)}
                        >
                            {
                                props.customer ?
                                    props.customer.map((item, index) =>
                                        (
                                            <Option key={item.companyId + 'customer' + index} value={item.companyId}>{item.companyName}</Option>
                                        )
                                    ) :
                                    (
                                        <></>
                                    )
                            }
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Text>Branch</Text>
                    <Form.Item
                        name="branchId"
                        rules={[{ required: true, message: 'Please input Sub Location!' }]}
                    >
                        <Select
                            className="select"
                            placeholder="Select sub location"
                            disabled={props.isDisabledBranch || props.isEdit}
                        >
                            {
                                props.subLocation ?
                                    props.subLocation.map((item, index) =>
                                        (
                                            <Option key={item.branchId + 'branch' + index} value={item.branchId}>{item.branchName}</Option>
                                        )
                                    ) :
                                    (
                                        <></>
                                    )
                            }
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Text>Priority</Text>
                    <Form.Item
                        name="priorityId"
                        rules={[{ required: true, message: 'Please input Priority!' }]}
                        shouldUpdate={(prevValues, curValue) => {
                            if (prevValues.branchId !== curValue.branchId) {
                                handleBranchChange(curValue.branchId)
                            }
                        }}
                    >
                        <Select
                            className="select"
                            placeholder="Select an option"
                        >
                            {
                                props.dataPriority ?
                                    props.dataPriority.map((item, index) =>
                                        (
                                            <Option key={item.codeId + 'priority' + index} value={item.codeId}>{item.codeName}</Option>
                                        )
                                    ) :
                                    (
                                        <></>
                                    )
                            }
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Text>SLA</Text>
                    <Form.Item
                        name="slaId"
                        rules={[{ required: true, message: 'Please input SLA!' }]}
                    >
                        <Select
                            className="select"
                            placeholder="Select an option"
                            disabled
                        >
                            {
                                props.slaType ?
                                    props.slaType.map((item, index) =>
                                        (
                                            <Option key={item.slaId + 'sla' + index} value={item.slaId}>{item.SLA}</Option>
                                        )
                                    ) :
                                    (
                                        <></>
                                    )
                            }
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Text>PIC</Text>
                    <Form.Item
                        name="picId"
                        rules={[{ required: true, message: 'Please input PIC!' }]}
                    >
                        <Select
                            className="select"
                            placeholder="Select an option"
                            disabled
                        >
                            {
                                props.pic ?
                                    props.pic.map((item, index) =>
                                        (
                                            <Option key={item.picId + 'pic' + index} value={item.picId}>{item.picName}</Option>
                                        )
                                    ) :
                                    (
                                        <></>
                                    )
                            }
                        </Select>
                    </Form.Item>
                </Col>
                {/* <Col span={12}>
                    <Text>Date</Text>
                    <Form.Item
                        name="ticketDate"
                        rules={[{ required: true, message: 'Please input Date!' }]}
                    >
                        <DatePicker
                            className="input-modal"
                            style={{
                                width: '100%'
                            }}
                            onChange={(date, dateString) => props.onChangeDate(date, dateString)}
                        />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Text>Time</Text>
                    <Form.Item
                        name="ticketTime"
                        rules={[{ required: true, message: 'Please input Time!' }]}
                    >
                        <TimePicker
                            className="input-modal"
                            style={{
                                width: '100%'
                            }}
                            format={format}
                            onChange={(time, timeString) => props.onChangeTime(time, timeString)}
                        />
                    </Form.Item>
                </Col> */}
                <Col span={12}>
                    <Text>Category</Text>
                    <Form.Item
                        name="categoryId"
                        rules={[{ required: true, message: 'Please input Category!' }]}
                    >
                        <Select
                            className="select"
                            placeholder="Select an option"
                        >
                            {
                                props.category ?
                                    props.category.map((item, index) =>
                                        (
                                            <Option key={item.codeId + 'category' + index} value={item.codeId}>{item.codeName}</Option>
                                        )
                                    ) :
                                    (
                                        <></>
                                    )
                            }
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Text>Duration</Text>
                    <Form.Item
                        name="ticketDurationTime"
                        rules={[{ required: true, message: 'Please input Duration!' }]}
                    >
                        <Select
                            className="select"
                            placeholder="Select an option"
                        >
                            {
                                props.duration ?
                                    props.duration.map((item, index) =>
                                        (
                                            <Option key={item.id + 'durationT' + index} value={item.id}>{item.duration}</Option>
                                        )
                                    ) :
                                    (
                                        <></>
                                    )
                            }
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={4}>
                    <Text>Geofencing</Text>
                    <Form.Item
                        name="geofencing"
                        rules={[{ required: true, message: 'Please choose Geofencing!' }]}
                    >
                        <Switch checkedChildren="Yes" unCheckedChildren="No" defaultChecked={props.dataEdit ? props.dataEdit.geofencing : true} />
                    </Form.Item>
                </Col>
                <Col span={8} hidden>
                    <Text>Reference Ticket</Text>
                    <Form.Item
                        name="refTicketCode"
                    >
                        <Select
                            className="select"
                            showSearch
                            placeholder="Select an option"
                            onSearch={props.searchRefTicket}
                            optionFilterProp="children"
                            filterOption={false}
                        >
                            {props.refTicket}
                        </Select>
                    </Form.Item>
                </Col>
                {/* <Col span={12}>
                    <Text>Job Class</Text>
                    <Form.Item
                        name="jobClassId"
                        rules={[{ required: true, message: 'Please input Job Class!' }]}
                    >
                        <Select
                            className="select"
                            placeholder="Select an option"
                            onChange={e => props.onChangeJobClass(e)}
                        >
                            {
                                props.jobClass ?
                                    props.jobClass.map( (item, index) =>
                                        (
                                            <Option key={item.jobClassId + 'jobCLass' + index} value={item.jobClassId}>{item.jobClassName}</Option>
                                        )
                                    ) :
                                    (
                                        <></>
                                    )
                            }
                        </Select>
                    </Form.Item>
                </Col> */}
                {/* <Col span={24}>
                    <Text>Job Category</Text>
                    <Form.Item
                        name="jobCategoryId"
                        rules={[{ required: true, message: 'Please input Job Category!' }]}
                    >
                        <Select
                            className="select"
                            placeholder="Select an option"
                            onChange={e => props.onChangeJobCategory(e)}
                        >
                            {
                                props.jobCategory ?
                                    props.jobCategory.map( (item, index) =>
                                        (
                                            <Option key={item.jobCategoryId + 'jobCat' + index} value={item.jobCategoryId}>{item.jobCategoryName}</Option>
                                        )
                                    ) :
                                    (
                                        <></>
                                    )
                            }
                        </Select>
                    </Form.Item>
                </Col> */}
                <Col span={24}>
                    <Text>Job</Text>
                    <Form.Item
                        name="jobId"
                        rules={[{ required: true, message: 'Please input Job!' }]}
                    >
                        <Select
                            className="select"
                            showSearch
                            placeholder="Select an option"
                            onSearch={props.searchJob}
                            optionFilterProp="children"
                            filterOption={false}
                        >
                            {props.job}
                        </Select>
                    </Form.Item>
                </Col>
                {/* <Col span={12}>
                    <Text>Report</Text>
                    <Form.Item
                        name="reportId"
                        rules={[{ required: true, message: 'Please input Report!' }]}
                        shouldUpdate={(prevValues, curValue) => {
                            if (prevValues.jobCategoryId !== curValue.jobCategoryId) {
                                handleJobCategoryChange(curValue.jobCategoryId)
                            }
                        }}
                    >
                        <Select
                            className="select"
                            placeholder="Select an option"
                            disabled
                        >
                            {
                                props.dataReport ?
                                    props.dataReport.map( (item, index) =>
                                        (
                                            <Option key={item.reportId + 'report' + index} value={item.reportId}>{item.reportName}</Option>
                                        )
                                    ) :
                                    (
                                        <></>
                                    )
                            }
                        </Select>
                    </Form.Item>
                </Col> */}
            </Row>
            <Row gutter={20}>
                <Col span={24}>
                    <Text>Description</Text>
                    <Form.Item
                        name="description"
                        rules={[
                            {
                                required: true,
                                message: 'Please input description!'
                            }
                        ]}
                    >
                        <TextArea maxLength={255} rows={4} className="input-modal" />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Button
                        onClick={openFileBrowser}
                        type="primary"
                        style={{
                            borderRadius: 15,
                            marginLeft: 10
                        }}
                        loading={loadingUpload}
                    >
                        <UploadOutlined /> Upload assignment letter
                    </Button>
                    <span
                        style={{
                            marginLeft: 15
                        }}
                    >
                        {
                            fileName ?
                                (fileName) :
                                props.dataEdit ?
                                    props.dataEdit.fileName :
                                    ""
                        }
                    </span>
                    <input
                        type="file"
                        hidden
                        onChange={fileHandler}
                        ref={fileInput}
                    />
                </Col>
                <Col span={24}>
                    <Form.Item
                        style={{
                            textAlign: 'right',
                            marginTop: '20px'
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
                                loading={props.loadingCreateTicket || loadingUpload}
                            >
                                Save
                            </Button>
                        </Space>
                    </Form.Item>
                </Col>
            </Row>
            {/* </Spin> */}
        </Form>
    )
}

const CancelForm = props => {
    const [form] = Form.useForm()
    if (props.visible === false) {
        form.resetFields();
    }
    return (
        <Form
            form={form}
            onFinish={values => props.onFinish(values)}
        >
            <Row gutter={20}>
                <Col span={24}>
                    <Text>Reason</Text>
                    <Form.Item
                        name="reasonCancel"
                        rules={[
                            {
                                required: true,
                                message: 'Please input Reason!'
                            }
                        ]}
                    >
                        <TextArea maxLength={255} rows={4} className="input-modal" />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Form.Item
                        style={{
                            textAlign: 'right',
                            marginTop: '20px'
                        }}
                    >
                        <Space size='small'>
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
                                loading={props.loadingCancelTicket}
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
let codeHistory = ''
class ModalCreateEdit extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visibleHistory: false,
            visibleNote: false,
            reason: ''
        }
    }


    handleModalHistory = (e, data) => {
        this.setState({ visibleHistory: !this.state.visibleHistory })
        if (e !== 'close') {
            codeHistory = data.ticketCode || ''
            this.getDetailHistory(data.ticketId);
        }
    }

    async getDetailHistory(id) {
        this.setState({
            loading: true
        });
        let data = [];
        await FSMServices.getDetailHistoryDispatch(id)
            .then(res => {
                data = res ? res.data.Data[0] : []
            })

        this.setState({
            listHistory: data.history.map(item => {
                var date = "";
                var _date = new Date(item.Date);
                if (_date.getDate() < 10) {
                    date += "0" + _date.getDate() + "/";
                } else {
                    date += _date.getDate() + "/";
                }
                if (_date.getMonth() < 10) {
                    date += "0" + (_date.getMonth() + 1) + "/";
                } else {
                    date += (_date.getMonth() + 1) + "/";
                }
                date += _date.getFullYear() + " ";
                if (_date.getHours() < 10) {
                    date += "0" + _date.getHours() + ":";
                } else {
                    date += (_date.getHours()) + ":";
                }
                if (_date.getMinutes() < 10) {
                    date += "0" + _date.getMinutes() + ":";
                } else {
                    date += (_date.getMinutes()) + ":";
                }
                if (_date.getSeconds() < 10) {
                    date += "0" + _date.getSeconds();
                } else {
                    date += (_date.getSeconds());
                }
                return {
                    key: `history${item.workerId}`,
                    status: item.dispatchStatus,
                    action: item.dispatchAction,
                    date: date,
                    reason: item.reason
                }
            })
        });

        this.setState({
            loading: false
        })
    }

    handleModalNote = (e, id) => {
        this.setState({
            visibleNote: !this.state.visibleNote
        })
        if (e !== 'close') {
            this.getDataNote(id)
        }
    }

    async getDataNote(id) {
        this.setState({
            loadingNote: true
        });
        let data = [];
        await FSMServices.getNoteTicketId(id).then(res => {
            data = res ? res.data.Data[0] : []
        })

        this.setState({
            listNote: data.dispatchNote.map(item => {
                var date = "";
                var _date = new Date(item.Date);
                if (_date.getDate() < 10) {
                    date += "0" + _date.getDate() + "/";
                } else {
                    date += _date.getDate() + "/";
                }
                if (_date.getMonth() < 10) {
                    date += "0" + (_date.getMonth() + 1) + "/";
                } else {
                    date += (_date.getMonth() + 1) + "/";
                }
                date += _date.getFullYear() + " ";
                if (_date.getHours() < 10) {
                    date += "0" + _date.getHours() + ":";
                } else {
                    date += (_date.getHours()) + ":";
                }
                if (_date.getMinutes() < 10) {
                    date += "0" + _date.getMinutes() + ":";
                } else {
                    date += (_date.getMinutes()) + ":";
                }
                if (_date.getSeconds() < 10) {
                    date += "0" + _date.getSeconds();
                } else {
                    date += (_date.getSeconds());
                }
                return {
                    date: date,
                    note: item.note
                }
            })
        });
        this.setState({
            loadingNote: false
        })
    }

    handleReport = data => {
        let textTemp =  ''
        if (Array.isArray(data)) {
            data.map((res, index) => {
                console.log(index, data.length)
                if (index + 1 !== data.length) {
                    textTemp = textTemp + res.fieldName + ' - '
                }else {
                    textTemp = textTemp + ' ' + res.fieldName
                }
                return textTemp
            })
            return (
                <Title className="body-detail" level={4}>
                    {textTemp}
                </Title>
            )
        }else if (data !== undefined && data !== null) {
            console.log('masuk')
            return (
                <Title className="body-detail" level={4}>
                    {data}
                </Title>
            )
        }
    }

    render() {

        return (
            <div>
                {this.props.title === "Update Ticket" || this.props.title === "New Ticket" ?
                    <Modal
                        visible={this.props.visible}
                        className="form-modal"
                        footer={null}
                        closable={false}
                        centered
                        width={750}
                    >
                        <Title level={3}>
                            {this.props.title}
                        </Title>

                        {
                            this.props.visible ?
                                (
                                    <FormCreateEdit
                                        customer={this.props.customer}
                                        onChangeCustomer={e => this.props.onChangeCustomer(e)}
                                        subLocation={this.props.subLocation}
                                        slaType={this.props.dataSLA}
                                        dataReport={this.props.dataReport}
                                        searchJob={this.props.searchJob}
                                        dataPriority={this.props.dataPriority}
                                        slaId={this.props.slaId}
                                        isEdit={this.props.isEdit ? this.props.isEdit : false}
                                        pic={this.props.pic}
                                        job={this.props.job}
                                        jobCategory={this.props.jobCategory}
                                        onChangeJobCategory={e => this.props.onChangeJobCategory(e)}
                                        jobClass={this.props.jobClass}
                                        onChangeJobClass={e => this.props.onChangeJobClass(e)}
                                        buttonCancel={this.props.buttonCancel}
                                        category={this.props.category}
                                        duration={this.props.duration}
                                        onFinish={(values, fileName, filePath) => this.props.onFinish(values, fileName, filePath)}
                                        onChangeDate={(date, dateString) => this.props.onChangeDate(date, dateString)}
                                        onChangeTime={(time, timeString) => this.props.onChangeTime(time, timeString)}
                                        dataEdit={this.props.dataEdit}
                                        loadingCreateTicket={this.props.loadingCreateTicket}
                                        loading={this.props.loading}
                                        refTicket={this.props.refTicket}
                                        searchRefTicket={this.props.searchRefTicket}
                                        isDisabledBranch={this.props.isDisabledBranch}
                                    />
                                ) :
                                (
                                    <></>
                                )
                        }

                    </Modal>
                    : this.props.title === 'Cancel Ticket' ?
                        <Modal
                            visible={this.props.visible}
                            className="form-modal"
                            footer={null}
                            closable={false}
                            centered
                        >
                            <Title level={3}>
                                {this.props.title}
                            </Title>

                            {this.props.visible ?
                                (
                                    <CancelForm
                                        onFinish={this.props.onFinish}
                                        buttonCancel={this.props.buttonCancel}
                                        loadingCancelTicket={this.props.loadingCancelTicket}
                                        visible={this.props.visible}
                                    />
                                ) : (
                                    <>
                                    </>
                                )
                            }
                        </Modal>
                    : this.props.title === 'Reopen Ticket' ?
                        <Modal
                            visible={this.props.visible}
                            className="form-modal"
                            footer={null}
                            closable={false}
                            centered
                        >
                            <Title level={3}>
                                {this.props.title}
                            </Title>

                            {this.props.visible ?
                                (
                                    <CancelForm
                                        onFinish={this.props.onFinish}
                                        buttonCancel={this.props.buttonCancel}
                                        loadingCancelTicket={this.props.loadingReopenTicket}
                                        visible={this.props.visible}
                                    />
                                ) : (
                                    <>
                                    </>
                                )
                            }
                        </Modal>
                        :
                        <Modal
                            visible={this.props.visible}
                            className="form-modal"
                            footer={null}
                            closable={false}
                            centered
                            width={650}
                        >
                            <Spin spinning={this.props.loading} tip={'Loading'}>
                                <Row gutter={15}>
                                    <Col span={24}>
                                        <Title level={3}>{this.props.title} {'#' + this.props.dataTicket.ticketCode}</Title>
                                    </Col>
                                    { (this.props.dataTicket.referenceTicketCode) ?
                                      <div>
                                        <Col span={24}>
                                            <Text><b>Ref. Ticket ID</b></Text>
                                        </Col>
                                        <Col span={24}>
                                            <Title className="body-detail" level={4}>{'#' + this.props.dataTicket.referenceTicketCode}</Title>
                                        </Col>
                                      </div>
                                      : <></>
                                    }
                                    <Col span={24}>
                                        <Text><b>Title</b></Text>
                                    </Col>
                                    <Col span={24}>
                                        <Title className="body-detail" level={4}>{this.props.dataTicket.ticketTitle}</Title>
                                    </Col>
                                    <Col span={12}>
                                        <Text><b>Customer</b></Text>
                                    </Col>
                                    <Col span={12}>
                                        <Text><b>Branch</b></Text>
                                    </Col>
                                    <Col span={12}>
                                        <Title className="body-detail" level={4}>{this.props.dataTicket.customerName}</Title>
                                    </Col>
                                    <Col span={12}>
                                        <Title className="body-detail" level={4}>{this.props.dataTicket.branchName}</Title>
                                    </Col>
                                    <Col span={12}>
                                        <Text><b>PIC</b></Text>
                                    </Col>
                                    <Col span={12}>
                                        <Text><b>History</b></Text>
                                    </Col>
                                    <Col span={12}>
                                        <Title className="body-detail" level={4}>{this.props.dataTicket.picName}</Title>
                                    </Col>
                                    <Col span={12}>
                                        <Text className="text-detail" style={{ fontSize: 12 }} onClick={() => this.handleModalHistory('detail', this.props.dataTicket)}>SEE HISTORY</Text>
                                    </Col>
                                    <Col span={12}>
                                        <Text><b>Priority</b></Text>
                                    </Col>
                                    <Col span={12}>
                                        <Title className="body-detail" level={4}>{this.props.dataTicket.priorityName}</Title>
                                    </Col>
                                    <Col span={24}>
                                        <Text><b>SLA</b></Text>
                                    </Col>
                                    <Col span={24}>
                                        <Title className="body-detail" level={4}>{this.props.dataTicket.slaName}</Title>
                                    </Col>
                                    <Col span={8}>
                                        <Text><b>Date</b></Text>
                                    </Col>
                                    <Col span={16}>
                                        <Text><b>Time</b></Text>
                                    </Col>
                                    <Col span={8}>
                                        <Title className="body-detail" level={4}>{this.props.dataTicket.ticketDate}</Title>
                                    </Col>
                                    <Col span={16}>
                                        <Title className="body-detail" level={4}>{this.props.dataTicket.ticketTime}</Title>
                                    </Col>
                                    <Col span={8}>
                                        <Text><b>Category</b></Text>
                                    </Col>

                                    <Col span={8}>
                                        <Text><b>Duration (Hours)</b></Text>
                                    </Col>
                                    <Col span={8}>
                                        <Text><b></b></Text>
                                    </Col>
                                    <Col span={8}>
                                        <Title className="body-detail" level={4}>{this.props.dataTicket.categoryName}</Title>
                                    </Col>
                                    <Col span={8}>
                                        <Title className="body-detail" level={4}>{this.props.dataTicket.ticketDurationTime}</Title>
                                    </Col>
                                    <Col span={8}>
                                        <Text><b></b></Text>
                                    </Col>
                                    <Col span={8}>
                                        <Text><b>Job Category</b></Text>
                                    </Col>
                                    <Col span={8}>
                                        <Text><b>Job Class</b></Text>
                                    </Col>
                                    <Col span={8}>
                                        <Text><b>Job</b></Text>
                                    </Col>
                                    <Col span={8}>
                                        <Title className="body-detail" level={4}>{this.props.dataTicket.jobCategoryName}</Title>
                                    </Col>
                                    <Col span={8}>
                                        <Title className="body-detail" level={4}>{this.props.dataTicket.jobClassName}</Title>
                                    </Col>
                                    <Col span={8}>
                                        <Title className="body-detail" level={4}>{this.props.dataTicket.jobName}</Title>
                                    </Col>
                                    <Col span={24}>
                                        <Text><b>Report</b></Text>
                                    </Col>
                                    <Col span={24}>
                                        <Title className="body-detail" level={4}>{this.props.dataTicket.reportName && this.props.dataTicket.reportName.map((data, idx) => idx === 0 ? data.fieldName : (" - " + data.fieldName))}</Title>
                                    </Col>
                                    <Col span={24}>
                                        <Text><b>Description</b></Text>
                                    </Col>
                                    <Col span={24}>
                                        <TextArea rows={4} readOnly={true} className="input-modal" value={this.props.dataTicket.ticketDesc}></TextArea>
                                    </Col>
                                    <Col span={24} style={{ textAlign: 'right', marginTop: 40, marginBottom: 15 }}>
                                        <Space size={'small'}>
                                            {this.props.status === "Open" && this.props.accessRight.includes('Dispatch') ? (
                                                <Button
                                                    type="primary"
                                                    style={{
                                                        paddingLeft: '20px',
                                                        paddingRight: '20px',
                                                        borderRadius: '5px'
                                                    }}
                                                    onClick={this.props.buttonDispatch}
                                                >
                                                    DISPATCH
                                                </Button>
                                            ) : (
                                                    <>
                                                    </>
                                                )}
                                            {this.props.status !== "Open" ? (
                                                <Button
                                                    style={{
                                                        paddingLeft: '20px',
                                                        paddingRight: '20px',
                                                        borderRadius: '5px'
                                                    }}
                                                    onClick={() => this.handleModalNote('Open', this.props.dataTicket.ticketId)}
                                                >
                                                    Note
                                                </Button>
                                            ) : (
                                                    <></>
                                                )}
                                            <Button
                                                type="danger"
                                                style={{
                                                    paddingLeft: '20px',
                                                    paddingRight: '20px',
                                                    borderRadius: '5px'
                                                }}
                                                onClick={this.props.buttonCancel}
                                            >
                                                Close
                                    </Button>
                                        </Space>
                                    </Col>
                                </Row>
                            </Spin>
                        </Modal>
                }
                <Modal
                    visible={this.state.visibleHistory}
                    className="form-modal"
                    footer={null}
                    closable={false}
                    centered
                    width={650}
                >
                    <Title level={3}>Dispatching History #{codeHistory} </Title>
                    <Table
                        size="middle"
                        columns={[
                            {
                                title: "Status",
                                dataIndex: "status",
                                key: 'status',
                                render: status => {
                                    if (status.toLowerCase() === "dispatched") {
                                        return (
                                            <Tag color="blue">{status}</Tag>
                                        )
                                    } else if (status.toLowerCase() === "canceled") {
                                        return (
                                            <Tag color="red">{status}</Tag>
                                        )
                                    } else if (status.toLowerCase() === "confirmed") {
                                        return (
                                            <Tag color="green">{status}</Tag>
                                        )
                                    } else if (status.toLowerCase() === "hold") {
                                        return (
                                            <Tag color="orange">{status}</Tag>
                                        )
                                    } else {
                                        return (
                                            <Tag >{status}</Tag>
                                        )
                                    }
                                },
                            },
                            {
                                title: "Action",
                                dataIndex: "action",
                                key: 'action'
                            },
                            {
                                title: "Date",
                                dataIndex: "date",
                                key: 'date'
                            },
                            {
                                title: "Reason",
                                dataIndex: "reason",
                                key: 'reason'
                            },
                        ]}
                        dataSource={this.state.listHistory}
                        loading={this.state.loading}
                    // scroll={{x: 1100}}
                    />
                    <Row gutter={15}>
                        <Col span={24} style={{ textAlign: 'right', marginTop: 40, marginBottom: 15, }}>
                            <Space size={'small'}>
                                <Button
                                    type="danger"
                                    style={{
                                        paddingLeft: '20px',
                                        paddingRight: '20px',
                                        borderRadius: '5px'
                                    }}
                                    onClick={() => this.handleModalHistory('close')}
                                >
                                    Close
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Modal>
                <Modal
                    visible={this.state.visibleNote}
                    className="form-modal"
                    footer={null}
                    closable={false}
                    centered
                    width={450}>
                    <Table
                        size="middle"
                        columns={[
                            {
                                title: "Note",
                                dataIndex: "note",
                                key: 'note'
                            },
                            {
                                title: "Date",
                                dataIndex: "date",
                                key: 'date'
                            },
                        ]}
                        dataSource={this.state.listNote}
                        loading={this.state.loadingNote}
                    // scroll={{x: 1100}}
                    />
                    <Row gutter={15}>
                        <Col span={24} style={{ textAlign: 'right', marginTop: 40, marginBottom: 15, }}>
                            <Space size={'small'}>
                                <Button
                                    type="danger"
                                    style={{
                                        paddingLeft: '20px',
                                        paddingRight: '20px',
                                        borderRadius: '5px'
                                    }}
                                    onClick={() => this.handleModalNote('close', '')}
                                >
                                    Close
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Modal>
            </div>
        )
    }
}

export default ModalCreateEdit;
