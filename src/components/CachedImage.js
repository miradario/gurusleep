import React, { Component } from 'react'
import { View, Image, ActivityIndicator, Dimensions, Platform } from 'react-native'
import * as FileSystem from 'expo-file-system';
import { checkInternetConnection } from 'react-native-offline';

class CachedImage extends Component {
  state = { 
    loading: true, 
    failed: false,
    imguri: '', 
  }

async componentDidMount() {
    const isConnected = await checkInternetConnection();
    const source = this.props.source.uri
    const extension = source.slice((source.lastIndexOf(".") - 1 >>> 0) + 2)
    if ((extension.toLowerCase() !== 'jpg') && (extension.toLowerCase() !== 'png') && (extension.toLowerCase() !== 'gif')) {
      this.setState({ loading: false, failed: true })
    }
    if (isConnected) {
          this.loadLocal(source);
    } else {
        this.loadLocal(`${FileSystem.documentDirectory + this.props.title}.${ extension }`);
    }
  }
  loadLocal(uri) {
      this.setState({ imguri: uri, loading: false});
  }
  render() {
    const { style, resizeMode, noWrap} = this.props
    if (this.state.failed) {
      // if the image url has an issue
      return( <View></View> );
    }
    // otherwise display the image
    if (noWrap) {
      return(
          <Image
            style={style}
            source={{ uri: this.state.imguri ? this.state.imguri : null }}
            resizeMode={resizeMode}
          />
      );
    } else {
      return(
        <View>
          <Image
            style={style}
            source={{ uri: this.state.imguri ? this.state.imguri : null }}
            resizeMode={resizeMode}
          />
        </View>
      );      
    }
  }
}
export default CachedImage;