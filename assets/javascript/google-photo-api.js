
const db = firebase.firestore();
    
let uid = null;
let email = "";

(function(){    
    const firebase = app_firebase;
    firebase.auth().onAuthStateChanged(function(user) {
                        
        if (user) {
            uid = user.uid;
            email = user.email;  
        }
        else {
            uid = null;
            window.location.replace("index.html");
        }
    });
})();

window.onload = function(){    
  
  GoogleObj.init();  
  setTimeout
  ( 
      function () {
        GoogleObj.authenticate().then(GoogleObj.loadClient(GoogleObj.APIKey, GoogleObj.ClientURL));
        document.getElementById("title").innerText = " - " + email;  
    },
  1000);
  
  //console.log(GoogleObj.AccessToken);
};

  const Logger  = {
      
      resultDiv: document.getElementById("div-result"),
      
      logResult: function () {
        document.getElementById("div-result").innerHTML = "";  
        const h3Elem = document.createElement("h3");
        h3Elem.innerText = "Event successful!";
        document.getElementById("div-result").appendChild(h3Elem);       
    },

    logClientResult: function () {
      document.getElementById("div-result").innerHTML = "";  
      const h3Elem = document.createElement("h3");
      h3Elem.innerText = "Event successful!";
      document.getElementById("div-result").appendChild(h3Elem);  

      GoogleObj.LoadData();      
  }, 

  logCreateAlbumResult: function (canvas, response) {
    document.getElementById("div-result").innerHTML = "";  
    
    const h3Elem = document.createElement("h3");

    if (response.result) {     
      GoogleObj.AlbumId =  response.result.id;
      GoogleObj.AlbumName =  response.result.title;


      canvas.toBlob(GoogleObj.uploadBlob( GoogleObj.AccessToken,GoogleObj.AlbumId, GoogleObj.uploadImage,GoogleObj.uploadMediaItem));      
        
      const docuName = email ; 
      db.collection("potato-face-app-" + uid).doc(docuName).set({
          albumId: GoogleObj.AlbumId,
          albumName: GoogleObj.AlbumName,        
      })
      .then(function(docRef) {
          console.log("album added to db!");        
      })
      .catch(function(error) {
        console.log("album was not added to db!");      
      });       
      
      setInterval( function () {
        GoogleObj.searchAlbum(GoogleObj.AlbumId);          
      }, 3000);


      const result =  JSON.stringify(response.result, null, 2);   
      h3Elem.innerText = JSON.stringify(response.result, null, 2);
      

    } 
    else {
      h3Elem.innerText = "API didn't perfom as expected";
    }
    document.getElementById("div-result").appendChild(h3Elem);   
  },

  logSearchResult: function (response) {
    
    if (response.result) {
      const gellary = document.getElementById("div-gellary");      
      gellary.innerHTML = "";

      const mediaItems = response.result.mediaItems;
      if (!this.IsObjValid(mediaItems)) return false;   
      mediaItems.forEach(function(item) { 
          const img = document.createElement("img");
          img.src = item.baseUrl;
          img.alt = item.description;
          img.className = "img-fluid img-thumbnail";
          img.height = 50;
          img.width = 50;
          gellary.appendChild(img);
      });       

    }

    //console.log(JSON.stringify(response.result, null, 2));
    
    document.getElementById("div-result").innerHTML = "";  
    
    const h3Elem = document.createElement("h3");

    if (response.result) {     
      const result =  JSON.stringify(response.result, null, 2);   
      h3Elem.innerText = JSON.stringify(response.result, null, 2);     
    } 
    else {
      h3Elem.innerText = "API didn't perfom as expected";
    }
    document.getElementById("div-result").appendChild(h3Elem);   
  },


  logAPIResult: function (response) {
      document.getElementById("div-result").innerHTML = "";  
      
      const h3Elem = document.createElement("h3");

      if (response.result) {     
        const result =  JSON.stringify(response.result, null, 2);   
        h3Elem.innerText = JSON.stringify(response.result, null, 2);     
      } 
      else {
        h3Elem.innerText = "API didn't perfom as expected";
      }
      document.getElementById("div-result").appendChild(h3Elem);   
    },

  logError: function (err) {      
      document.getElementById("div-result").innerHTML = "";  
      const h3Elem = document.createElement("h3");
      h3Elem.innerText = JSON.stringify(err, null, 2);
      h3Elem.style = "color: red";
      document.getElementById("div-result").appendChild(h3Elem); 
    },

    PopulateAlbumIdFromDb : function (querySnapshot) {        
      const collName = "potato-face-app-" + uid;          
      db.collection(collName).get().then(function(querySnapshot) {           
        querySnapshot.forEach(function(doc) {
          let dbDoc = doc.data();
          
          GoogleObj.AlbumId = dbDoc.albumId;
          GoogleObj.AlbumName = dbDoc.albumName;
          console.log("No need to create album: " + JSON.stringify(dbDoc));   
          GoogleObj.searchAlbum(GoogleObj.AlbumId);             
        });       
               
      });
      
    },

    IsObjValid: function (obj)
    {
      return obj && obj !== 'null' && obj !== 'undefined';
    }
  };

  const GoogleObj = {

    IntervalFunc : {},
    AccessToken : {},
    UploadToken: {},
    FileToUpload: {},    
    AlbumId: {},
    AlbumName: "potato-face-app",
        
    Clientid:   "667952832919-uc0e43h07p9cug4719gbgk30eqas4pcq.apps.googleusercontent.com",    
    SignInScope: "https://www.googleapis.com/auth/photoslibrary",
    APIKey: "AIzaSyAMjI4hlim0iu8QlmXzJlCSJbMgUAPxafo", 
    ClientURL: "https://content.googleapis.com/discovery/v1/apis/photoslibrary/v1/rest",

    init : function() {
      this.gapiload(this.Clientid, this.APIKey);      
    },

    gapiload: function (clientId, APIKey) {  
              gapi.load("client:auth2", function() {
                        gapi.auth2.init({client_id: clientId,
                        apiKey: APIKey,
                        discoveryDocs: "https://content.googleapis.com/discovery/v1/apis/photoslibrary/v1/rest",
                        scope : "https://www.googleapis.com/auth/photoslibrary https://www.googleapis.com/auth/plus.login"                                                
                      });
                        
              });
    }, 

    authenticate: function () {   
      this.AccessToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;   
      console.log("AccessToken:" + this.AccessToken )   ;
      return gapi.auth2.getAuthInstance()
      .signIn({scope: this.SignInScope })     
      .then(Logger.logResult,Logger.logError);
    },



    loadClient: function (APIKey, clientURL) {
      gapi.client.setApiKey(APIKey);
      
      return gapi.client.load(clientURL)      
      .then(Logger.logClientResult,Logger.logError);
    },

    uploadMediaItem: function (albumId, uploadToken) {
      const mediaItem = {
        resource: { 
          albumId: albumId,
          newMediaItems : [{
                description : "potato-face-app-pic",
                simpleMediaItem : {
                uploadToken : uploadToken
              }
            }
          ],
        },
      };

      return gapi.client.photoslibrary.mediaItems.batchCreate(mediaItem)
          .then(Logger.logAPIResult,Logger.logError);
    },

    searchAlbum: function (albumId) { 
    
      const albumIdObj = {
        resource: { 
          albumId: albumId,         
        },
      }; 

      return gapi.client.photoslibrary.mediaItems.search(albumIdObj)      
        .then(
          function (response) {                  
            Logger.logSearchResult(response);
          },Logger.logError);          
    },


    createAlbum: function (canvas, albumName) { 
    
      const albumObj = {
              resource: { 
                  album : {
                    title: albumName,
                  },
            },
      };

    return gapi.client.photoslibrary.albums.create(albumObj)    
        .then(
               function (response) {
                  Logger.logCreateAlbumResult(canvas, response);
               },Logger.logError);          
    },

    
    uploadImage : function (accessToken,albunId,imageName, imageContent, CallBack) {
        
      const url = "https://photoslibrary.googleapis.com/v1/uploads";

      fetch(url, {
            mode: "cors",
            method: "post",
            headers: {
              'Authorization' : "Bearer " + accessToken,
              'Content-type': "application/octet-stream",              
              'X-Goog-Upload-File-Name' : imageName,
              'X-Goog-Upload-Protocol': "raw",   
            },
            //encoding : "base64",
            body: imageContent,
      }).then (
        function(response) {
          if (response.status !== 200) {
            console.log('Looks like there was a problem. Status Code: ' + response.status);
            return;
          }
          return  response.text();            
        }
      ).then (
          function (responsText) {  
              this.UploadToken = responsText;                            
              //console.log(responsText);
              CallBack(albunId, responsText);
              
          }
      ).catch(function(err) {
        console.log('Fetch Error :-S', err);
      });                   
    },

    LoadData : function (){        
      const collName = "potato-face-app-" + uid;          
      db.collection(collName).get().then(function(querySnapshot) {   
        Logger.PopulateAlbumIdFromDb(querySnapshot);
      });
    },


    uploadBlob : function (AccessToken,AlbumId, Callback, Callback2  ) {
      return function(blob) {
        const fileReader = new FileReader();
        fileReader.onloadend = function () {
                                  const fileContent = fileReader.result;                                
                                  Callback(AccessToken,AlbumId, "potato-face-pic.jpg",fileContent, Callback2 );
                                };
        fileReader.readAsArrayBuffer(blob);
      };
    },

    convertImageToCanvas: function(image) {
      var canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      canvas.getContext("2d").drawImage(image, 0, 0);
    
      return canvas;
    },

    convertCanvasToImage: function (canvas) {
      var image = new Image();
      image.src = canvas.toDataURL("image/png");
      return image;
    }
  };

  document.getElementById("save").addEventListener("click", function(event) {
    
    html2canvas(document.getElementById("outer-dropzone"))
    .then(function(canvas) {        

        if (!GoogleObj.AlbumName.includes(email))
        {
          GoogleObj.createAlbum(canvas, GoogleObj.AlbumName +"-"+ email);
          console.log("New album created: " + JSON.stringify(GoogleObj)); 
          return false;  
        }
        else
        {
          console.log("Album already exist: " + JSON.stringify(GoogleObj)); 
        }

        
        if (Object.entries(GoogleObj.AlbumId).length === 0 ) 
        {
          console.log("invalid album id:" + JSON.stringify(GoogleObj.AlbumId));
          return false;
        }

        canvas.toBlob(GoogleObj.uploadBlob( GoogleObj.AccessToken,GoogleObj.AlbumId, GoogleObj.uploadImage,GoogleObj.uploadMediaItem));      
        
        const docuName = email ; 
        db.collection("potato-face-app-" + uid).doc(docuName).set({
            albumId: GoogleObj.AlbumId,
            albumName: GoogleObj.AlbumName,        
        })
        .then(function(docRef) {
            console.log("album added to db!");        
        })
        .catch(function(error) {
          console.log("album was not added to db!");      
        });       
        
        clearTimeout(GoogleObj.IntervalFunc);
        GoogleObj.IntervalFunc  = setInterval( function () {
          GoogleObj.searchAlbum(GoogleObj.AlbumId);          
        }, 5000);
        
    });
  });

  document.getElementById("logout").addEventListener("click", function(event){          
    firebase.auth().signOut().then(function() {
                                        }).catch(function(error) {
                                            console.dir(error);
                                        });
});


