import React from "react";
import { withRouter } from 'react-router-dom';

class FooterLayout extends React.Component {
  render() {
    return (
      <React.Fragment>
        <hr />
        <div>Footer</div>
      </React.Fragment>
    );
  }
}

export default withRouter(FooterLayout);
