import React from 'react';
import { Text, View, TouchableOpacity, TextInput, Image, StyleSheet, ToastAndroid, KeyboardAvoidingView } from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
export default class TransactionScreen extends React.Component {
    constructor(){
      super();
      this.state = {
        hasCameraPermissions: null,
        scanned: false,
        scannedBookId: '',
        scannedStudentId:'',
        buttonState: 'normal'
      }
    }

    getCameraPermissions = async (id) =>{
      const {status} = await Permissions.askAsync(Permissions.CAMERA);
      
      this.setState({
        /*status === "granted" is true when user has granted permission
          status === "granted" is false when user has not granted the permission
        */
        hasCameraPermissions: status === "granted",
        buttonState: id,
        scanned: false
      });
    }

    handleBarCodeScanned = async({type, data})=>{
      const {buttonState} = this.state

      if(buttonState==="BookId"){
        this.setState({
          scanned: true,
          scannedBookId: data,
          buttonState: 'normal'
        });
      }
      else if(buttonState==="StudentId"){
        this.setState({
          scanned: true,
          scannedStudentId: data,
          buttonState: 'normal'
        });
      }
      
    }
    initiatebookissue=async()=>{
      db.collection("transactions").add({
        'studentid':this.state.scannedStudentId,
        'bookid':this.state.scannedBookId,
        'data':firebase.firestore.Timestamp.now().toDate(),
        'transactiontype':"issue"
          });
          db.collection("books").doc(this.state.scannedBookId).update({
            'bookavailibility':false
          })
          db.collection("students").doc(this.state.scannedstudentId).update({
            'numberofbooksissued':firebase.firestore.Fieldvalue.increment(1)
          }) 
          this.setState({
            scannedStudentId:'',
            scannedBookId:''
          })
    }
    initiatebookreturn=async()=>{
      db.collection("transactions").add({
        'studentid':this.state.scannedStudentId,
        'bookid':this.state.scannedBookId,
        'data':firebase.firestore.Timestamp.now().toDate(),
        'transactiontype':"return"
          })
          db.collection("books").doc(this.state.scannedBookId).update({
            'bookavailibility':true
          })
          db.collection("students").doc(this.state.scannedstudentId).update({
            'numberofbooksissued':firebase.firestore.Fieldvalue.increment(-1)
          }) 
          this.setState({
            scannedStudentId:'',
            scannedBookId:''
          })
    }
    checkstudentelegibilityforissue=async()=>{

      const studentref=await db.collection("students").where("studentid","==",this.state.scannedStudentId).get();
      var isstudenteligible="";
      if(studentref.docs.length==0){
        this.setState({
          scannedstudentId:"",
          scannedBookId:""
        });
        isstudenteligible=false
        alert("the student id doesnt exist in the database");
      }
      else{
        studentref.docs.map(doc=>{
          var student=doc.data();
          if(student.numberofbooksissued<2){
            isstudenteligible=true;
          }else{
            isstudenteligible=false;
            alert("the student already has 2 books");
            this.setState({
              scannedstudentId:"",
              scannedBookId:""
            });
          }
        })
      }
      return isstudenteligible;

       }
       checkstudentelegibilityforreturn=async()=>{
         const transactionref=await db.collection("transactions").where("bookid","==",this.state.scannedBookId).limit(1).get();
         var isstudenteligible="";
         transactionref.docs.map(doc=>{
           var lastbooktransation=doc.data();
           if(lastbooktransation.studentid===this.state.scannedStudentId){
             isstudenteligible=true;
           }
           else{
             isstudenteligible=false;
             alert("the book wasnt issued to the student");
             this.setState({
              scannedstudentId:"",
              scannedBookId:""
            });   
           }
         })
         return isstudenteligible;
       }
       checkbookeligiblity=async()=>{
         const bookref=await db.collection("books").where("bookid","==",this.state.scannedBookId).get();
         var transactiontype="";
         if(bookref.docs.length==0){
           transactiontype=false;
         }
         else{
           bookref.docs.map(doc=>{
             
           })
         }
       }
handletransactions=async()=>{
  var transactiontype=await this.checkbookeligiblity();
  if(!transactiontype){
  alert("The boook doesnt exist in the database");
  this.setState({
    scannedStudentId:"",
    scannedBookId:""
    });
  }
  else if(transactiontype==="issue"){
    var isstudenteligible=await this.checkstudeneligibilityforissue();
    if(isstudenteligible){
      this.initiatebookissue();
      alert("bookissuedtothestudent");
    }
  }
  else {
    var isstudenteligible=await this.checkstudeneligibilityforreturn();
    if(isstudenteligible){
      this.initiatebookreturn();
      alert("bookreturnedtothelibrary");
    }
  }
};

    render() {
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const scanned = this.state.scanned;
      const buttonState = this.state.buttonState;

      if (buttonState !== "normal" && hasCameraPermissions){
        return(
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        );
      }

      else if (buttonState === "normal"){
        return(
          <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
            <View>
              <Image
                source={require("../assets/booklogo.jpg")}
                style={{width:200, height: 200}}/>
              <Text style={{textAlign: 'center', fontSize: 30}}>Wily</Text>
            </View>
            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Book Id"
              onChangeText={text=>this.setState({scannedBookId:text})}
              value={this.state.scannedBookId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("BookId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Student Id"
              onChangeText={text=>this.setState({scannedStudentId:text})}
              value={this.state.scannedStudentId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("StudentId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.submitbutton}
            onPress={async()=>{
              var transactionmessage=this.handletransactions();
              this.setState({
                scannedBookId:'',
                scannedstudentId:''
              })
            }}>
              <Text style={styles.submitbuttontext}>Submit</Text>
            </TouchableOpacity>
            
          </KeyboardAvoidingView>
        );
      }
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10
    },
    inputView:{
      flexDirection: 'row',
      margin: 20
    },
    inputBox:{
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20
    },
    scanButton:{
      backgroundColor: '#66BB6A',
      width: 50,
      borderWidth: 1.5,
      borderLeftWidth: 0
    },
    submitbutton:{
      backgroundColor:'#FBC02D',
      width:100,
      height:50
    },
    submitbuttontext:{
      padding:10,
     textAlign:'center',
     fontSize:20,
     fontweight:"bold",
     color:'white'
        }
  });