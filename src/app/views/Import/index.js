import React from "react";
import { withRouter } from "react-router-dom";
import {
    Layout,
    Typography,
    Row,
    Col,
    Button,
    Card,
    Space,
    Select,
    notification,
    Table,
    Modal
} from "antd";
import { FSMServices } from '../../service';
import PermissionDenied from '../../global/permissionDenied'
import Cookies from 'js-cookie'
import constant from '../../global/constant'

const { Option } = Select;
const { Content } = Layout;
const { Title } = Typography;

class Import extends React.Component {
    constructor(props) {
        super(props);
        document.title = this.props.name + " | FSM"

        this.state = {
            visibleCard: false,
            visibleButton: false,
            userId: Cookies.get('userId'),
            isAgain: false,
            selected: "Select data to import",
            buttonImportContent: "Select file",
            isDisabledUpload: false,
            accessRight: ''
        }
        this.fileInput = React.createRef();
    }

    componentDidMount(){
      setTimeout(() => this.setState({accessRight: sessionStorage.getItem("accessRight")}),500);
    }

    onChangeImport = value=> {
        this.setState({
            selected: value
        });
    }

    async checkValidation(data) {
        this.setState({
            loadingCheckValidation: true,
            isDisabledUpload: true
        });
        let tempDataValid = [];
        let tempDataNonValid = [];
        let i = 0;
        await FSMServices.importCheckValidation(data).then( res => {
            tempDataValid = res && res.data && res.data['Data Valid'] ? res.data['Data Valid'] : [];
            tempDataNonValid = res && res.data && res.data['Data Non Valid'] ? res.data['Data Non Valid'] : [];
        });

        this.setState({
            dataValid: tempDataValid.map( item => {
                i++;
                return {
                    ...item,
                    key: i
                }
            }),
            dataNonValid: tempDataNonValid.map( item => {
                let information = "";
                item["Informasi Data Non Valid"].map( itemInformation => {
                    let itemToSring = JSON.stringify(itemInformation);
                    information += itemToSring.slice(1, itemToSring.length-1) + ', ';
                    return null;
                });
                return {
                    key: item.No,
                    ...item,
                    information: information
                }
            }),
            dataImport: tempDataValid.map( item => {
                let mapping = {};

                mapping['Branch Id'] = item['Branch Id'];
                mapping['PIC Id'] = item['PIC Id'];
                mapping['Title'] = item['Title'];
                mapping['Duration'] = item['Duration'];
                mapping['Job Id'] = item['Job Id'];
                mapping['Code Id'] = item['Code Id'];
                mapping['SLA Id'] = item['SLA Id'];
                mapping['Description'] = item['Description'];
                mapping['Priority Id'] = item['Priority Id'];
                mapping['Is Geofencing'] = item['Is Geofencing'];
                mapping['Reference Ticket'] = item['Reference Ticket'];

                return mapping;
            }),
            loadingCheckValidation: false,
            dataLoaded: true,
            isDisabledUpload: false
        });

        if ( this.state.dataNonValid.length ) {
            this.setState({
                visibleNonValid: true
            })
        }
    }

    closeModal = () => {
        this.setState({ visibleNonValid: false });
    }

    fileHandler = (event) => {
        this.setState({
            buttonImportContent: "Change file",
            isAgain: false
        });
        if (event.target.files.length) {
            let fileObj = event.target.files[0];
            let fileName = fileObj.name;

            if (fileName.slice(fileName.lastIndexOf('.') + 1) === "xlsx" || fileName.slice(fileName.lastIndexOf('.') + 1) === "xls" ) {
                this.setState({
                    uploadedFileName: fileName,
                    file: event.target.files[0]
                }, async () => {
                    const formData = new FormData();
                    formData.append('file', this.state.file);
                    await this.checkValidation(formData);
                });
            }
            else {
                this.setState({
                    uploadedFileName: ""
                })
            }
        }
        return event.target.value = '';
    }

    openFileBrowser = () => {
        this.fileInput.current.click();
    }

    import = (userId, data) => {
        this.setState({ loading: true });
        FSMServices.importTicket(userId, data).then( res => {
            if (
                res &&
                res.status === 200 ?
                res.data.Status !== "BAD_REQUEST" : false
            ) {
                notification.success({
                    placement: 'bottomRight',
                    message: 'Success',
                    description: 'Import Success',
                });
                this.setState({
                    isAgain: true,
                    isDisabledUpload: true
                });
            } else {
                notification.error({
                    placement: 'bottomRight',
                    message: 'Error',
                    description: 'Import Error'
                });
            }
            this.setState({ loading: false })
        })
    }

    onImport = () => {
        this.import(this.state.userId, this.state.dataImport);
    }

    uploadAnotherFileHandler = () => {
        this.setState({
            isAgain: false,
            selected: "Select data to import",
            dataLoaded: false,
            buttonImportContent: "Select file",
            uploadedFileName: "",
            isDisabledUpload: false
        });
    }

    render() {
        const { accessRight } = this.state
        const columns = [
            {
                title: 'Ref Ticket ID',
                dataIndex: 'Reference Ticket',
                key: 'Reference Ticket',
            },
            {
                title: 'Title',
                dataIndex: 'Title',
                key: 'Title',
            },
            {
                title: 'Customer',
                dataIndex: 'Customer',
                key: 'Customer',
            },
            {
                title: 'Branch',
                dataIndex: 'Branch',
                key: 'Branch',
            },
            {
                title: 'Priority',
                dataIndex: 'Priority',
                key: 'Priority',
            },
            {
                title: 'PIC',
                dataIndex: 'PIC',
                key: 'PIC',
            },
            {
                title: 'Category',
                dataIndex: 'Category',
                key: 'Category',
            },
            {
                title: 'Duration',
                dataIndex: 'Duration',
                key: 'Duration',
            },
            {
                title: 'Description',
                dataIndex: 'Description',
                key: 'Description',
            },
            {
                title: 'Job',
                dataIndex: 'Job',
                key: 'Job',
            },
            {
                title: 'Job Class',
                dataIndex: 'Job Class',
                key: 'Job Class',
            },
            {
                title: 'Job Category',
                dataIndex: 'Job Category',
                key: 'Job Category',
            },
            {
                title: 'Is Geofencing',
                dataIndex: 'Is Geofencing',
                key: 'Is Geofencing',
            },
        ];

        const columnsNonValid = [
            {
                title: 'No',
                dataIndex: 'key',
                key: 'key',
            },
            {
                title: 'Title',
                dataIndex: 'Title',
                key: 'Title',
            },
            {
                title: 'Customer',
                dataIndex: 'Customer',
                key: 'Customer',
            },
            {
                title: 'Branch',
                dataIndex: 'Branch',
                key: 'Branch',
            },
            {
                title: 'Information',
                dataIndex: 'information',
                key: 'information',
            },
        ];
        return (
            <Content className="content">
              { accessRight.includes('Read') || accessRight == "" ?
                <div>
                  <Row
                      style={{
                          marginBottom: '15px'
                      }}
                  >
                      <Col md={24}>
                          <Space size={20}>
                              <Title
                                  level={2}
                                  style={{
                                      display: 'inline-block',
                                      marginBottom: '10px'
                                  }}
                              >
                                  Data Import
                                  </Title>
                          </Space>
                      </Col>
                      <Col md={24} style={{marginBottom:"1em"}}>
                          <Select
                              className="select-import"
                              onChange={this.onChangeImport}
                              value={this.state.selected}
                          >
                              <Option value="ticketing-template">Ticketing</Option>
                          </Select>
                          {this.state.selected !== "Select data to import" &&
                              <a href={`${constant.import.downloadTemplate}${this.state.selected}.xls`} target="_blank">
                                  <span
                                      className="link-import"
                                      style={{
                                          marginLeft: 20
                                      }}
                                  >
                                      Download data template file
                                  </span>
                              </a>
                          }
                      </Col>
                      {this.state.selected !== "Select data to import" ?
                          <Col md={12}>
                              <Button
                                  onClick={this.openFileBrowser.bind(this)}
                                  className="button-import select-file"
                                  loading={this.state.loadingCheckValidation}
                              >
                                  {this.state.buttonImportContent}
                              </Button>
                              {
                                  this.state.uploadedFileName &&
                                  <span
                                      style={{ marginLeft: 10 }}
                                  >
                                      {this.state.uploadedFileName}
                                  </span>
                              }
                              <input
                                  type="file"
                                  hidden
                                  onChange={this.fileHandler.bind(this)}
                                  style={{
                                      "padding": "10px"
                                  }}
                                  ref={this.fileInput}
                                  accept="application/vnd.ms-excel"
                              />
                          </Col>
                          :
                          <></>
                      }
                  </Row>
                  {this.state.dataLoaded &&
                      <div>
                          <Row style={{ marginTop: 10 }}>
                              <Col span={24}>
                                  <Card
                                      className="card-master-data"
                                      bordered={false}
                                  >
                                      <Table
                                          dataSource={this.state.dataValid}
                                          columns={columns}
                                          scroll={{x: 1600}}
                                          size={'middle'}
                                          pagination={false}
                                      />
                                  </Card>
                              </Col>
                          </Row>
                          <Modal
                              visible={this.state.visibleNonValid}
                              footer={false}
                              onCancel={this.closeModal}
                              width='90%'
                              centered
                          >
                              <Row>
                                  <Col span={24}>
                                      <Typography.Title level={2} style={{ fontWeight: 'normal', margin: 0 }}>
                                          Data Non Valid
                                      </Typography.Title>
                                      <hr />
                                  </Col>
                              </Row>
                              <Row style={{ marginTop: 25 }}>
                                  <Col span={24}>
                                      <Table
                                          columns={columnsNonValid}
                                          dataSource={this.state.dataNonValid}
                                          pagination={false}
                                          size={'middle'}
                                      />
                                  </Col>
                              </Row>
                          </Modal>
                          { accessRight.includes('Create') ?
                            <Button
                                type="primary"
                                disabled={!this.state.dataValid.length || this.state.isDisabledUpload}
                                className="button-import upload-file"
                                onClick={this.onImport}
                                loading={this.state.loading}
                            >
                                Upload File
                            </Button>
                            :<></>
                          }

                          <br />
                          { this.state.isAgain &&
                              <span
                                  className="link-import"
                                  onClick={this.uploadAnotherFileHandler}
                              >
                                  Upload another file
                              </span>
                          }
                      </div>
                  }
                </div>
                :
                <PermissionDenied />
              }
            </Content>
        );
    }
}

export default withRouter(Import);
