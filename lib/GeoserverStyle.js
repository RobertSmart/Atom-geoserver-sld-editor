'use babel';
/** @jsx etch.dom */
import etch from 'etch';
import request from 'request';

export default class GeoserverStyle {
  // Required: Define an ordinary constructor to initialize your component.

  constructor (props, children) {
    this.textEditor = null;
    this.props = props
    this.props.data = null
    //console.log(this.props)
    this.props.edited = false;
    this.fetchStyleData(this.props.info.href);
    etch.initialize(this)
  }

  render () {
    return (
      <atom-panel class='padded' style='padding-top:2px;padding-bottom:2px;'>
        <div style='margin-bottom:5px;'>
          <h4 class='text-subtle' style='display:inline;'>Name - </h4><h2 style='display:inline;' >{this.props.info.name}</h2>
        </div>
        <div class='block'>
          <div class={this.props.data ? '' : 'hidden'}>
            <button class='btn btn-primary icon icon-cloud-download inline-block-tight' on={{click: this.getStyle}}>Pull</button>
            <button class={this.props.edited ? 'btn btn-error icon icon-cloud-upload inline-block-tight' : 'btn icon icon-cloud-upload inline-block-tight'} on={{click: this.setStyle}}>Push</button>
          </div>
        </div>
      </atom-panel>
    )
  }

  // Required: Update the component with new properties and children.
  update (props, children) {

    return etch.update(this)
  }

  // Optional: Destroy the component. Async/await syntax is pretty but optional.
  async destroy () {
    // call etch.destroy to remove the element and destroy child components
    await etch.destroy(this)
    // then perform custom teardown logic here...
  }

  onTextEdited(){
    //console.log(self)
    this.props.edited = true;
    this.update()
    console.log('buffer changed');
  }

  addToWorkSpace(text){
    var self = this;
    atom.workspace.open().then((editor)  =>
      {
        var styleType
        switch (self.props.data.style.format) {
          case "css":
            styleType = "CSS"
            break;
          case "sld":
            styleType = "XML"
            break;
          default:
            styleType = "XML"
        }

        var grammar = atom.grammars.getGrammars().find(g => {return g.name == styleType})

        editor.onDidChange(function(){
          self.onTextEdited()
        })

        editor.setGrammar(grammar)
        editor.insertText(text)
        self.props.edited = false
        self.textEditor = editor
    })
  }

  getStyle(){
    var url = this.props.host + "/styles/" + this.props.data.style.filename

    var headers = {
        'accept': 'application/xml',
        'content-type' : 'application/xml'
    };
    var self = this;
    request
    .get({ url: url, headers: headers })
    .auth(self.props.cred.username, self.props.cred.password, false)
    .on('error', function(err){
      console.log(err);
    })
    .on('response', function(response) {
      var tempdata = ""

      response.on('error', (err) =>{
        console.log(err);
      })

      response.on('data',  (chunk) => {
        tempdata += chunk;
      });

      response.on('end', function() {
        //console.log(tempdata);
        var styleInfo = tempdata;
        //console.log(styleInfo);
        self.addToWorkSpace(styleInfo)
        //self.update();
      });

    })
  }

  setStyle(){
    var newStyle = this.textEditor.getText();
    var url = this.props.host + "/styles/" + this.props.data.style.filename

    console.log(url);

    var self =this;

//request({ url: url, method: 'PUT', auth:{}, body: newStyle }, function(res){console.log(res)});

    request
    .put({ url: url, body: newStyle, headers: {
        'accept': 'application/json',
        'Content-type' : 'application/vnd.ogc.sld+xml'
    }})
    .auth(this.props.cred.username, this.props.cred.password, false)
    .on('error', function(err){
      console.log('error');
      console.log(err);
    })
    .on('response', function(response){
      console.log(response);
      //self.textEditor.save()
      self.props.edited = false
      self.update()
    })


  //  this.textEditor.save()
  //  this.props.edited = false
  //  this.update()
  }

  fetchStyleData (dataUrl){
    //console.log(dataUrl)

      var self = this;
      request
      .get({ url: dataUrl, headers: {
          'accept': 'application/json',
          'content-type' : 'application/json'
      }})
      .auth(self.props.cred.username, self.props.cred.password, false)
      .on('error', function(err){
        console.log(err);
      })
      .on('response', function(response) {
        var tempdata = ""

        response.on('error', (err) =>{
          console.log(err);
        })

        response.on('data',  (chunk) => {
          tempdata += chunk;
        });

        response.on('end', function() {
          //console.log(tempdata);
          self.props.data = JSON.parse(tempdata);
          self.update();
        });

      })

  }
}
