import React, { Component } from 'react';
import './App.css';
import Navigation from './components/Navigation/Navigation';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';

// Particles
import ParticlesWrapper from './components/ParticlesWrapper/ParticlesWrapper';

const initialState = {
    input: '',
    imageUrl: '',
    boxes: [],
    route: 'signin', // Initially should go to the signin page
    isSignedIn: false,
    user: {
        id:'',
        name:'',
        email:'',
        entries:0,
        created: ''
    }
}

class App extends Component {

    constructor() {
        super();
        this.state = initialState;
    }

    loadUser = (data) => {
        this.setState({ 
            user: {
                id: data.id,
                name:data.name,
                email:data.email,
                entries:data.entries,
                created: data.created
            }
        });
    }


    // Getting the value of the image link field
    onInputChange = (event) => {
        // console.log(event.target.value);
        this.setState({
            input: event.target.value
        });
    }

    calculateFaceLocation = (data) => {
        const image = document.getElementById('inputimage');
        const image_height = Number(image.height);
        const image_width = Number(image.width);
        const boxes = data.map(face_region => {
            const face = face_region.region_info.bounding_box;
            return {
                leftCol:(image_width*face.left_col),
                topRow:(image_height*face.top_row),
                rightCol:(image_width - image_width*face.right_col),
                bottomRow: (image_height - image_height*face.bottom_row)
            }
        });
        return boxes
    }

    displayFaceBox = (boxes) => {
        this.setState({ boxes:boxes });
    }

    onPictureSubmit = () => {

        this.setState({
            imageUrl: this.state.input,
        }); // imageUrl set to the current input in the field

        fetch('http://localhost:3000/clarifai',{
            method:'post',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({
                input:this.state.input
            })
        })
            .then(response => response.json())
            .then(result => this.displayFaceBox(this.calculateFaceLocation(result.outputs[0].data.regions)))
            .then(done => {
                    fetch('http://localhost:3000/image',{
                        method:'put',
                        headers:{'Content-Type':'application/json'},
                        body: JSON.stringify({
                            id:this.state.user.id
                        })
                    })
                        .then(data=>data.json())
                        .then(entries=>this.setState(Object.assign(this.state.user,{entries:entries}))) // Changing a property of an object without re/over-writing the whole object.
                        .catch(err=>console.log);
            })
            .catch(error => console.log('API Error', error));
    }

    // To go from signin -> app or app -> signin
    onRouteChange = (route) => {
        if (route==='signout') {
            this.setState(initialState);
        } else if (route==='home'){
            this.setState({isSignedIn:true});
        }

        this.setState({ route: route});
    }
    render() {
        const { isSignedIn, route, boxes, imageUrl } = this.state;
        // {onRouteChange,onInputChange,onButtonSubmit} = this;
        return (
            <div className="App">
                {/* Had to use a wrapper since we can't init the particles engine (a "hook") in a class component*/}
                <ParticlesWrapper className='particles' />
                <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
                { route === 'home'
                ? <div>
                    <Logo />
                    <Rank user={this.state.user}/>
                    <ImageLinkForm changeFunction={this.onInputChange} submitFunction={this.onPictureSubmit}/>
                    <FaceRecognition boxes={boxes} url={imageUrl} />
                  </div>
                : (
                    this.state.route === 'signin'
                    ? <SignIn onRouteChange={this.onRouteChange} loadUser={this.loadUser} />
                    : <Register onRouteChange={this.onRouteChange} loadUser={this.loadUser} />
                )
                }
            </div>
        );
    }
}

export default App;
