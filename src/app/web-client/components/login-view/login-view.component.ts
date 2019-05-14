import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ContactsService } from '../../services/contacts-service';
import { Subscription } from 'rxjs';
import { LoggingService } from '../../../logging-service';
import { SocketManager } from '../../messaging/socket-manager';
import { LyncApiGlobals } from '../../lync-api/lync-api-globals';
import { LyncApiContainer } from '../../lync-api/lync-api-container';
import { LyncApiSignIn } from '../../lync-api/lync-api-signin';
import { LyncApiContacts } from '../../lync-api/lync-api-contacts';
import { LyncApiAudioService } from '../../lync-api/lync-api-audio-service';
import { LyncApiPresence } from '../../lync-api/lync-api-presence';
import { LyncApiInitializer } from '../../lync-api/lync-api-initializer';
import { Person } from '../../lync-api/lync-api-person';
import { Messaging } from '../../messaging/messaging';
import { Listeners } from '../../services/listeners';
import { Listener } from '../../services/listener';
import { Globals } from '../../services/globals';
import { CookiesService } from '../../services/cookies-service';
import { LyncApiNote } from '../../lync-api/lync-api-note';


@Component({
  selector: 'app-login-view',
  templateUrl: './login-view.component.html',
  styleUrls: ['./login-view.component.css']
})
export class LoginViewComponent implements OnInit, OnDestroy {

  private lyncApiSignIn: LyncApiSignIn;
  private lyncApiContacts: LyncApiContacts;
  private lyncApiAudioService: LyncApiAudioService;
  private lyncApiPresence: LyncApiPresence;
  private lyncApiNote: LyncApiNote;
  private lyncApiInitializer: LyncApiInitializer;
  private lyncApiGlobals: LyncApiGlobals;
  private presenceAndNoteSetListener: Listener<any>;

  constructor(
    private contactsService: ContactsService,
    private loggingService: LoggingService,
    private socketManager: SocketManager, private apiContainer: LyncApiContainer
    , private messaging: Messaging, private listeners: Listeners, private globals: Globals, private cookies: CookiesService
  ) {
    let currentApi = apiContainer.currentApi;

    this.lyncApiSignIn = currentApi.signIn;
    this.lyncApiContacts = currentApi.contactsService;
    this.lyncApiAudioService = currentApi.audioService;
    this.lyncApiPresence = currentApi.presence;
    this.lyncApiNote = currentApi.note;
    this.lyncApiInitializer = currentApi.initializer;
    this.lyncApiGlobals = currentApi.globals;

    this.presenceAndNoteSetListener = listeners.createListener<any>('PresenceAndNoteSet');
  }

  @Input() personLoggedIn: Person;

  presenceChangeSubscription: Subscription;

  currentPresence;

  ngOnInit() {
    this.messaging.initialized.subscribe(() => {

      this.lyncApiInitializer.initialize().then((client) => {

        if (this.lyncApiGlobals.personSignedIn) { //if lync sdk, then it's already signed in

          this.afterSignIn(this.lyncApiGlobals.personSignedIn);

          this.lyncApiSignIn.userSignedIn.subscribe(() => {
            this.afterSignIn(this.lyncApiGlobals.personSignedIn);
          })

          this.lyncApiSignIn.userSignedOut.subscribe(() => {
            this.afterSignOut();
          });

        }
        else {


          let username: string = this.cookies.getCookie('username');
          let password: string = this.cookies.getCookie('password');

          if (username && password) {
            this.onSignIn(username, password);
          }

        }


      }).
        catch(error => {
          console.log('App. initialize failed', error);
        });


      this.bindPresenceAndNoteSetListener();

    });


  }

  bindPresenceAndNoteSetListener() {
    this.presenceAndNoteSetListener.received.subscribe(r => {
      this.loggingService.log(`presence set request:${r.presence}, ${r.note}`);
      let lyncApiPresenceValue: string = this.globals.getApiPresenceForContactCenterPresence(r.presence);
      this.setPresenceOnRequest(lyncApiPresenceValue);
    });
  }

  bindPresenceChangeSubscription() {

    this.presenceChangeSubscription = this.lyncApiPresence.presenceChange.subscribe(p => {

      this.loggingService.log(`login-view, presence change ${p.personId},${p.presenceState},${this.personLoggedIn != undefined}`);

      if (this.personLoggedIn && p.personId == this.personLoggedIn.id) {
        this.currentPresence = p.presenceState;
      }

    });
  }

  ngOnDestroy() {
    this.presenceChangeSubscription.unsubscribe();
  }

  onSignOut() {


    this.lyncApiSignIn.signOut().then((r) => {

      this.afterSignOut();

    });

  }

  afterSignOut() {
    this.socketManager.unRegisterService(this.lyncApiGlobals.clientSip);
    this.socketManager.leaveRoom(this.lyncApiGlobals.clientSip);

    this.cookies.deleteCookie('username');
    this.cookies.deleteCookie('password');

    this.lyncApiPresence.unbindPresenceListenerForPerson(this.personLoggedIn);
    this.presenceChangeSubscription.unsubscribe();
    this.personLoggedIn = null;
    this.contactsService.contacts.next([]);
  }

  onSignIn(username, password) {
    this.lyncApiSignIn.signIn(username, password).then((person) => {

      if (person.id) {
        this.afterSignIn(person);

        this.cookies.setCookie('username', username, 1);
        this.cookies.setCookie('password', password, 1);
      }


    }).catch(err => {
      console.log(err);
    });
  }

  private afterSignIn(person: Person) {

    this.socketManager.registerService(person.id);
    this.socketManager.joinRoom(person.id);

    this.bindPresenceChangeSubscription();

    this.personLoggedIn = person;

    this.lyncApiPresence.bindPresenceListenerForPerson(person);
    this.lyncApiNote.bindNoteListenerForPerson(person);

    this.lyncApiAudioService.registerIncomingAudio();

    this.lyncApiContacts.getAll().then((contacts) => {
      //this.contacts =contacts;
      console.log('App. ', contacts);
      this.contactsService.contacts.next(contacts);
    });
  }

  onPresenceSelect(selectedValue: any) {
    //console.log(selectedValue);
    this.lyncApiPresence.setPresence(this.personLoggedIn, selectedValue);
  }

  setPresenceOnRequest(selectedValue: any) {
    //console.log(selectedValue);
    this.lyncApiPresence.setPresence(this.personLoggedIn, selectedValue);
  }

}
