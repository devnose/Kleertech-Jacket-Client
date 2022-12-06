import React, { useEffect } from "react";
import RemoteFileSystemProvider from "devextreme/file_management/remote_provider";
import "devextreme/dist/css/dx.common.css";
import "devextreme/dist/css/dx.light.css";
import FileManager, {
  FileSelectionItem,
  Item,
  Permissions,
  Toolbar,
  ItemView,
  Column,
  Details,
  ContextMenu,
} from "devextreme-react/file-manager";
import { channels } from "./shared/constants";
import UserLogger from "./components/UserLogger";
import "devextreme/ui/button";
import "devextreme/dist/css/dx.light.css";

import NewViewer from "./components/NewViewer";
import DocxViewer from "./components/DocxViewer";
import ChatMessage from "./components/Messenger/Messenger";
const axios = require("axios").default;
const { ipcRenderer } = window.require("electron");
const remoteFileProvider = new RemoteFileSystemProvider({
  endpointUrl: "http://192.168.168.173:8090/start",
});

//global variables
var username;
var path;

//recieving username from backend electron
ipcRenderer.send(channels.GET_USER, "love");
ipcRenderer.on(channels.GET_USER, (event, arg) => {
  username = arg;
});

//Get docx data from backend
function readDocsFromExpress(str) {
  const promise = axios.get(`http://192.168.168.173:8090/docx/${str}`);
  const dataPromise = promise.then((response) => response.data);
  return dataPromise;
}

//class file compoenent
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showPdf: false,
      setShowPdf: false,
      showDocx: false,
      setShowDocx: false,
      showMsg: false,
      setShowMsg: false,
      getPdf: [],
      setGetPdf: [],
      getDocx: [],
      setGetDocx: [],
      getAttatchment: [],
      setGetAttatchment: [],
      getMsg: [],
      setGetMsg: [],
      data: [],
      setData: [],
      getHtml: "",
      setHtml: "",
      initialData: "",
    };

    this.fileManagerRef = React.createRef();

    

    
    this.confirmationMenuOptions = {
      items: [
        {
          text: "Send Confirmation",
          icon: "tags",
        },
      ],
      onItemClick: this.onItemClick.bind(this),
    };

    this.jobjacketMenuOption = {
      items: [
        {
          text: "Print Job Jacket",
          icon: "print",
        },
      ],
      onItemClick: this.onItemClick.bind(this),
    };

    this.onItemClick = this.onItemClick.bind(this);
  }

  //set PDF FILE from backend
  setPdfFile = (file) => {
    if (file.indexOf('"') >= 0) {
      var str = file.replace(/"/g, "");
      this.setState(
        {
          setGetPdf: `http://192.168.168.173:8090/pdf/${str}`,
          getPdf: `http://192.168.168.173:8090/pdf/${str}`,
        },
        () => {
          console.log(str);
          return str;
        }
      );
    }
  };

  //Set docx data from backend
  setDocxFile = (file) => {
    if (file.indexOf('"') >= 0) {
      var str = file.replace(/"/g, "");
      readDocsFromExpress(str).then((data) => {
        this.setState({
          setGetDocx: <h1>{data}</h1>,
          getDocx: <h1>{data}</h1>,
        });
      });
    }
  };

  setAttachmentFile = (file) => {
    if (file.indexOf('"') >= 0) {
      var str = file.replace(/"/g, "");
      // this.setState({ setGetAttatchment: `http://192.168.168.173:8090/attachment/${str}`, getAttatchment: `http://192.168.168.173:8090/attachment/${str}`}, () => {
      this.setState({
        setGetMsg: `http://192.168.168.173:8090/msg/${str}`,
        getMsg: `http://192.168.168.173:8090/msg/${str}`,
      });
      this.fileManager.refresh(3000);
      this.setState({ setShowMsg: true, showMsg: true });

      // });
    }
  };

  // When a file is selected this function is fired
  fileManager_onSelectedFileOpened = (e) => {
    this.fileManager.refresh();

    //send path to backend
    axios.post("http://192.168.168.173:8090/dir", e["file"]).then((res) => {
      console.log(res);
    });

    //get object and find the file name
    var filename = JSON.stringify(e["file"]["name"]);
    //check to see if file has .pdf
    if (filename.includes(".pdf")) {
      //show Modal if pdf is oopened;
      this.setState({ setShowPdf: true, showPdf: true });
      this.setPdfFile(filename);

      //check to see if file is .DOCX
    } else if (filename.includes(".docx")) {
      //open the modal and set data
      this.setState({ setShowDocx: true, showDocx: true });
      this.setDocxFile(filename);

      //check to see if file is .MSG
    } else if (filename.includes(".msg")) {
      this.setAttachmentFile(filename);
      console.log(true);
    }

    // send log data
    const data = {
      username: username,
      action: "Opened file" + filename,
    };

    axios.post("http://192.168.168.173:8090/logData", data).then((res) => {
      console.log(res);
    });
    //send filename to backend for printing
    var to = JSON.stringify(e["file"]["relativeName"]);
    ipcRenderer.send(channels.GET_DIRECT, to.replace(/"/g, ""));
  };

  //file uploading [NON WORKING]
  onFileUploading = (e) => {
    const dataForm = new FormData();
    dataForm.append("filename", "test");
    dataForm.append("uploadedFile", e.fileData);
    console.log(e.fileData);
    axios.post("http://192.168.168.173:8090/upload", dataForm).then((res) => {
      console.log(res);
    });
  };

  // file Deletion [NON WORKING]
  onItemDeleted = (e) => {
    console.log(e.item);
    const j = JSON.stringify(e.item);
    fetch("http://192.168.168.173:8090/delete", {
      method: "POST",
      body: j,
      headers: {
        "Content-type": "application/json", // The type of data you're sending
      },
    });
  };

  //Any items on the menu that has been clicked.
  // onContextMenuItemClick = (e) => {
  //   //gets selection path thats directory
  //   var pathSelection = path["selectedItems"][0].path;
  //   //gets selection path thats not a directory
  //   var nonDirSelection = path["selectedItems"][0].parentPath;

  //   //what menu item was clicked?
  //   console.log(e);
  //   if (e["itemData"]["options"]["items"][0].text == "Send Confirmation") {
  //     if (path["selectedItems"][0]["pathKeys"].length > 2) {
  //       if (path["selectedItems"][0].isDirectory) {
  //         const data = {
  //           directory: pathSelection,
  //           username: username,
  //           action:
  //             "Order Confirmation Sent for job# " +
  //             path["currentSelectedItemKeys"],
  //         };
  //         axios.post("http://192.168.168.173:8090/confirm", data).then((res) => {
  //           if (res.data) {
  //             alert("Order Has been confirmed by someone else");
  //           } else {
  //             alert("Order Confirmation Sent");
  //           }
  //         });
  //       } else {
  //         const data = {
  //           directory: nonDirSelection,
  //           username: username,
  //           action:
  //             "Order Confirmation Sent for job# " +
  //             path["selectedItems"][0]["pathKeys"][2],
  //         };
  //         axios.post("http://192.168.168.173:8090/confirm", data).then((res) => {
  //           if (res.data) {
  //             alert("Order Has been confirmed by someone else");
  //           } else {
  //             alert("Order Confirmation Sent");
  //           }
  //         });

  //         console.log("nondirectory");
  //         setTimeout(() => {
  //           this.fileManager.refresh();
  //         }, 2000);
  //       }

  //       //axios.post('http://192.168.168.173:8090/confirm', data).then(res => { console.log(res) })
  //     } else {
  //       alert("Cannot Send Confirmation from this directory");
  //     }
  //   }

  //   if (e["itemData"]["options"]["items"][0].text == "Print Job Jacket") {
  //     console.log("job jacket print");
  //   }
  // };

  onSelect = (e) => {
    console.log(e);
    path = e;
  };

  // onCurrentDirectoryChanged = (e) => {
  //   this.fileManager.refresh()
  // }

  render() {
    return (
      <div className="main">

        <FileManager
          ref={this.fileManagerRef}
          onCurrentDirectoryChanged={this.onCurrentDirectoryChanged}
          fileSystemProvider={remoteFileProvider}
          onSelectedFileOpened={this.fileManager_onSelectedFileOpened}
          //onToolbarItemClick={this.onContextMenuItemClick}
          onContextMenuItemClick={this.onItemClick}
          onFileUploading={this.onFileUploading}
          onInitialized={this.onInitialized}
          onItemDeleted={this.onItemDeleted}
          onSelectionChanged={this.onSelect}
        >
          <Permissions
            create={true}
            copy={true}
            move={true}
            delete={true}
            rename={true}
            upload={true}
            download={true}
          ></Permissions>
          <ItemView showParentFolder={false}>
            <Details>
              <Column dataField="thumbnail"></Column>
              <Column dataField="name"></Column>
              <Column dataField="confirm" caption="Order Confirmed" width="180"></Column>
              <Column dataField="created" caption="Job Jacket Created " width="130"></Column>
              <Column dataField="rushed" caption="Rushed Order" width="120"></Column>

            </Details>
          </ItemView>
          <Toolbar>
            
  
            <FileSelectionItem
              widget="dxMenu"
              location="before"
              options={this.confirmationMenuOptions}
            />
                        <FileSelectionItem name="separator" />

            <FileSelectionItem
              widget="dxMenu"
              location="before"
              options={this.jobjacketMenuOption}
            />
            <FileSelectionItem name="refresh" />
            <FileSelectionItem name="clearSelection" />
          </Toolbar>
          <ContextMenu>

          <Item name="create" />
          <Item name="delete" />
          <Item text="Send Confirmation" icon="plus"/>
          <Item text="Print Job Jacket" icon="print"/>


          </ContextMenu>
        </FileManager>

        {/* <PdfViewer pdf={this.state.getPdf}
          onCancel={() => this.setState({ setShowPdf: false, showPdf: false })}
          visible={this.state.showPdf}
        
        /> */}

        <NewViewer
          pdf={this.state.getPdf}
          onCancel={() => this.setState({ setShowPdf: false, showPdf: false })}
          visible={this.state.showPdf}
        />

        <DocxViewer
          doc={this.state.getDocx}
          onCancel={() =>
            this.setState({ setShowDocx: false, showDocx: false })
          }
          visible={this.state.showDocx}
        />

        {/* <MsgViewer
          msg={this.state.getMsg}
          doc={this.state.getAttatchment}
          onCancel={() => this.setState({setShowMsg: false, showMsg: false})}
          visible={this.state.showMsg}/> */}
        <NewViewer
          pdf={this.state.getMsg}
          onCancel={() => this.setState({ setShowMsg: false, showMsg: false })}
          visible={this.state.showMsg}
        />

{/* <Button className="button">Clear Log</Button> */}


        <div className="down">
          {/* <UserLogger /> */}
          <UserLogger />
          <ChatMessage/>
        </div>

      
      </div>
    );
  }

  get fileManager() {
    return this.fileManagerRef.current.instance;
  }

  onItemClick({ itemData, viewArea, fileSystemItem }) {
    console.log(itemData.text);

    if(itemData.text === "Send Confirmation"){
      var directory = this.fileManager.getCurrentDirectory()
      var tenary = path["selectedItems"].length == 0 ? directory.path : path["selectedItems"][0].path; 


      const data = {
        directory: tenary,
        username: username,
        action:
          "Order Confirmation Sent for job# " +
          tenary,
      };

      axios.post("http://192.168.168.173:8090/confirm", data).then((res) => {
        if (res.data) {
          alert("Order Has been confirmed by someone else");
        } else {
          alert("Order Confirmation Sent");
        }
      });

      setTimeout(() => {
        this.fileManager.refresh();
      }, 2000);

    }



    if (itemData.text === "Print Job Jacket") {
      var directory = this.fileManager.getCurrentDirectory()
      var tenary = path["selectedItems"].length == 0 ? directory.path : path["selectedItems"][0].path; 
    
     
      ipcRenderer.send(channels.GET_JACKET, "start");
      var args;
      ipcRenderer.on(channels.GET_JACKET, (event, arg) => {
        args = arg;
        console.log(args)
      });

      setTimeout(() => {
        alert(
          "WARNING: Your printing multiple documents to create a job jacket"
        );
        console.log(args);
        const data = { dir: args, directory: tenary, username: username, };
        axios.post("http://192.168.168.173:8090/readPrintDir", data).then((res) => {
          console.log(res.data);

          if (res.data.success) {
            ipcRenderer.send(channels.GET_JACKET, res.data);

            const data = {
              username: username,
              action: "Printed Job Jacket: #20222152 ",
            };
            axios.post("http://192.168.168.173:8090/logData", data).then((res) => {
              console.log(res);
            });
          }
        });
      }, 5000);
    }
  }
}
export default App;
