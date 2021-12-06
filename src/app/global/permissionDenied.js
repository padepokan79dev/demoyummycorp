import React from "react";
import {
    Row,
    Col,
    Typography
} from "antd";
import ImagePermissionDenied from "../../assets/permissionDenied.png";
import Icon from '@ant-design/icons';

const { Text } = Typography;

const PermissionDeniedPng = () => (
  <img src={ImagePermissionDenied} alt="Notification" height="350px" />
)

const PermissionDeniedIcon = props => <Icon component={PermissionDeniedPng} {...props} />

class PermissionDenied extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Row>
                <Col span={24} style={{ textAlign: 'center' }}>
                    <PermissionDeniedIcon />
                    <br/><br/>
                    <h1><b>Access Denied</b></h1>
                    <h1>Hmmm... We're sorry, but you don't have permission to view this page.</h1>
                    <h1><b>Please contact your administrator.</b></h1>
                </Col>
            </Row>
        );
    }
}

export default PermissionDenied;
