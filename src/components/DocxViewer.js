import React, {useState} from "react";
import "antd/dist/antd.css";
import '../App.css';
import {Modal, Button} from "antd";




const DocxViewer = ({doc, onCancel, visible}) => {


    const footer = <div className="footer">
   



 </div>


    return (<Modal maskClosable={false}
        onCancel={onCancel}
        visible={visible}
        width={"60%"}
        bodyStyle={{height: 800, overflowY: 'auto'}}
        style={{ top: 20 }}
        footer={footer}>
            
{doc}


</Modal>)

};
export default DocxViewer;

