'use babel';

import GeoserverSldEditorView from './geoserver-sld-editor-view';
import { CompositeDisposable } from 'atom';

export default {

  geoserverSldEditorView: null,
  //modalPanel: null,
  subscriptions: null,
  rightPanel:null,

  activate(state) {
    //console.log(state.geoserverSldEditorViewState);
    this.geoserverSldEditorView = new GeoserverSldEditorView(state.geoserverSldEditorViewState);

    this.rightPanel = atom.workspace.addRightPanel({
      item: this.geoserverSldEditorView.getElement(),
      visible: false
    })
    //console.log(this.rightPanel);

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'geoserver-sld-editor:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    //this.modalPanel.destroy();
    this.rightPanel.destroy();
    this.subscriptions.dispose();
    this.geoserverSldEditorView.destroy();
  },

  serialize() {
    return {
      geoserverSldEditorViewState: this.geoserverSldEditorView.serialize()
    };
  },

  toggle() {
    console.log('GeoserverSldEditor was toggled!');
    return (
      this.rightPanel.isVisible() ?
      this.rightPanel.hide() :
      this.rightPanel.show()
    );
  }

};
