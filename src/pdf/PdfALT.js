import * as React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import PDFReader from 'rn-pdf-reader-js'

export default class Pdf extends React.Component {

  render() {
    return (
      <View style={styles.container}>
        <PDFReader
          source={{
            uri: 'http://www.africau.edu/images/default/sample.pdf',
          }}
        />
      </View>
    )
  }
}
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecf0f1',
  },
})