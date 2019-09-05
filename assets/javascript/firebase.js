var app_firebase = {};

(function () {

    const firebaseConfig = {
        apiKey: "AIzaSyAMjI4hlim0iu8QlmXzJlCSJbMgUAPxafo",
        authDomain: "potato-face.firebaseapp.com",
        databaseURL: "https://potato-face.firebaseio.com",
        projectId: "potato-face",
        storageBucket: "",
        messagingSenderId: "667952832919",
        appId: "1:667952832919:web:f932528d81701402"
      };

      // Initialize Firebase
      firebase.initializeApp(firebaseConfig);

      app_firebase = firebase;

})();