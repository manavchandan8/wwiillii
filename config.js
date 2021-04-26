import * as firebase from 'firebase'
 require('@firebase/firestore')
 
var firebaseConfig = {
    apiKey: "AIzaSyA4Ux5MDap3QOeKWo3y_ii3AQGaVbWaLRs",
    authDomain: "wili-5b608.firebaseapp.com",
    projectId: "wili-5b608",
    storageBucket: "wili-5b608.appspot.com",
    messagingSenderId: "934025555292",
    appId: "1:934025555292:web:04d35b73cd26c024996599"
  };
; // Initialize Firebase
 firebase.initializeApp(firebaseConfig); export default firebase.firestore();
