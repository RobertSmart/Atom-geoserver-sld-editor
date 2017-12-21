'use babel';
/** @jsx etch.dom */
import request from 'request';
import etch from 'etch';
import GeoserverStyle from './GeoserverStyle'

export default class GeoserverSldEditorView {

    constructor(serializedState) {
      this.properties = {}
      this.properties.hostUrl = serializedState ? serializedState.hostUrl || null : null
      this.properties.cred ={}
      this.properties.cred.username = null
      this.properties.cred.password =null

      this.properties.styles=[]

      console.log(this.properties)

      etch.initialize(this);
    }


    update(props, children) {
      return etch.update(this);
    }
    // Returns an object that can be retrieved when package is activated
    serialize() {
      var hostUrl =  document.getElementById('geoserverHostText').value;
      return {
       "hostUrl" :hostUrl
      }
    }

    // Tear down any state and detach
    destroy() {
      this.element.remove();
    }

    getElement() {
      return this.element;
    }

    render() {
      return (
       <div class='geoserver-sld-editor' style='overflow-y:scroll;'>
          <atom-panel class='padded'>
            <div class='inset-panel'>
              <div class='panel-heading icon icon-zap'>Geoserver Connection</div>
              <div class='panel-body padded'>
                <div class='block'>
                  <label>Host - {this.properties.hostUrl}</label>
                  <input class='input-text native-key-bindings' id='geoserverHostText' type='text' placeholder='Server Host' value={this.properties.hostUrl} on={{input:this.hostUrlChange}}/>
                </div>
                <div class='block'>
                  <label>Username</label>
                  <input class='input-text native-key-bindings' type='text' placeholder='Username' on={{input:this.usernameChange}}/>
                </div>
                <div class='block'>
                  <label>Password</label>
                  <input class='input-text native-key-bindings' type='password' placeholder='Password' on={{input:this.passwordChange}}/>
                </div>
                <button class="btn btn-primary" on={{click: this.connectClick}}>Connect</button>
              </div>
            </div>
          </atom-panel>
          <atom-panel class='styles padded'>
          {
          this.properties.styles.map(
            (style) => <GeoserverStyle info={style} cred={this.properties.cred} host={this.properties.hostUrl}/>
          )
        }
        </atom-panel>
       </div>
      );
    }

    hostUrlChange(event){
      //console.log(event.target.value);
      this.properties.hostUrl = event.target.value;
      this.update();
    }

    usernameChange(event){
      //console.log(event.target.value);
      this.properties.cred.username = event.target.value;
      //this.update();
    }

    passwordChange(event){
      //console.log(event.target.value);
      this.properties.cred.password = event.target.value;
      //this.update();
    }

    connectClick(event){
      this.connectToGeoserver();
    }


    connectToGeoserver(){
      var headers = {
          'accept': 'application/json',
          'content-type' : 'application/json'
      };
      var self = this;
      var url = this.properties.hostUrl + "/styles.json"

      request
      .get({ url: url, headers: headers })
      .auth(this.properties.cred.username, this.properties.cred.password, false)
      .on('error', function(err){
        console.log(err);
      })
      .on('response', function(response) {
        var tempStyles =""
        response.on('error', (err) =>{
          console.log(err);
        })

        response.on('data',  (chunk) => {
          tempStyles += chunk;
        });

        response.on('end', function() {
          styles = JSON.parse(tempStyles);

          console.log(styles);
          self.properties.styles = styles.styles.style;
          self.update();
        });

      })
    }
}
