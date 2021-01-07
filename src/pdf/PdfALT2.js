import * as React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import PDFView from 'react-native-view-pdf';

const resources = {
  url: 'https://www.ets.org/Media/Tests/TOEFL/pdf/SampleQuestions.pdf',
  base64: 'JVBERi0xLjMKJcfs...',
};

export default class App extends React.Component {
  render() {
    const resourceType = 'url';

    return (
      <View style={{ flex: 1 }}>
        {/* Some Controls to change PDF resource */}
        <PDFView
          fadeInDuration={250.0}
          style={{ flex: 1 }}
          resource={resources[resourceType]}
          resourceType={resourceType}
          onLoad={() => console.log(`PDF rendered from ${resourceType}`)}
          onError={() => console.log('Cannot render PDF', error)}
        />
      </View>
    );
  }
}