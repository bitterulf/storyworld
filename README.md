# storyworld
server application to create and explore stories

- [vision](#vision)
- [roadmap](#roadmap)
  - [structure development](#structure-development)
  - [server component](#server-component)
  - [web client](#web-client)
- [structure](#structure)
- [F.A.Q.](#faq)

## vision
The big picture for this project is to define a structure for interactive storytelling and to provide infrastructure to improve those stories while they are already published.

## roadmap
### structure development
First of all a clear structure has to be defined to cover as much story telling scenarios as possible with the least possible complexity.
### server component
This structure has to be implemented on the server side with a REST interface.
### web client
The last step is to create a easy to use web client so users can start to created story world with a simple ui.

## structure
- [identity](#identity)
- [story](#story)
 - [provider](#provider)
   - [action](#action)
   - [content](#content)
- [story instance](#story-instance)
 - [events](#events)

### identity
The identity is what the user logins with. Consits of username, email and password. In the final product users will also be able to create identities out of exisiting facebook or twitter logins.
### story
The main element the user can create with his identity. Stories can be created by any identity.
#### provider
A provider consists of logic that plays out next possible actions the user can do in the story as well as trigger content.
##### action
A action is a container wich contains the events that are added to the story instance after the user triggers the action.
##### content
The content container consists just of content wich is played out by the provider.
### story instance
A story instance is created when a user with a identity starts a story. The instance is saved on the server side and can be resumed at any time.
#### events
Every story instance contains just the events wich were added trough actions. From this event array the providers rebuild the next possible actions for the user to choose from.
## F.A.Q.

**Q** How do I install this project?

**A** Install node, pull this repository, run `npm install` and start everything with `node .`

---
