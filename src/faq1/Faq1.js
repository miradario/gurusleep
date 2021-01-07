import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Linking} from 'react-native';
import { Constants, WebBrowser } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import { SectionTitle } from '../components';
import Collapsible from 'react-native-collapsible';
import { BaseContainer, Images } from "../components";
import COLORS from "../assets/Colors";
import * as Matomo from 'react-native-matomo';
import * as commonFunctions from '../../utils/common.js';
import translate from "../../utils/language";

const goTo = (link) => {
  WebBrowser.openBrowserAsync(
    link
  );
}

export default class Faq1 extends Component {

  componentDidMount() {
    commonFunctions.matomoTrack('screen', 'FAQs');
  }

  render() {
    return (
      /*  <BaseContainer title={'FAQ'} scrollable  startGradient={COLORS.lightblue} endGradient={COLORS.white}>
       */
      <BaseContainer title={'FAQ'} scrollable webBackground startGradient={COLORS.lightblue} endGradient={COLORS.white}>
        <SectionTitle label="FAQs" iconName="ios-help-circle-outline" />
        <View style={styles.container}>
        
          <Question
            title={translate("FAQ.Q1")}
            content={translate("FAQ.R1")}
          />

          <Question
            title={translate("FAQ.Q2")}
            content={translate("FAQ.R2")}
          />
          <Question
            title={translate("FAQ.Q3")}
            content={translate("FAQ.R3")}
          />
          <Question
            title={translate("FAQ.Q4")}
            content={translate("FAQ.R4")}
          />
           <Question
            title={translate("FAQ.Q5")}
            content={translate("FAQ.R5")}
          />
          <Question
            title={translate("FAQ.Q6")}
            content={translate("FAQ.R6")}
          />
           <Question
            title={translate("FAQ.Q7")}
            content={translate("FAQ.R7")}
          />
           <Question
            title={translate("FAQ.Q8")}
            content={translate("FAQ.R8")}
          />
          <Question
            title={translate("FAQ.Q9")}
            content={translate("FAQ.R9")}
          />
           <Question
            title={translate("FAQ.Q10")}
            content={translate("FAQ.R10")}
          />           
           <Question
            title={translate("FAQ.Q11")}
            content={translate("FAQ.R11")}
          />             
           <Question
            title={translate("FAQ.Q12")}
            content={translate("FAQ.R12")}
          />   
           <Question
            title={translate("FAQ.Q13")}
            content={translate("FAQ.R13")}
          />   
           <Question
            title={translate("FAQ.Q14")}
            content={translate("FAQ.R14")}
          />   
           <Question
            title={translate("FAQ.Q15")}
            content={translate("FAQ.R15")}
          />   
          <Question
            title={translate("FAQ.Q16")}
            content={translate("FAQ.R16")}
          />   
          <Question
            title={translate("FAQ.Q17")}
            content={translate("FAQ.R17")}
          />   
        </View>
        <View style={{marginBottom: 20}}>
          <Text style={{padding: 10, textAlign: 'center', color: COLORS.gray, fontFamily: 'Avenir-Book'}}>{translate("FAQ.able")}</Text>
          <TouchableOpacity onPress={()=> {Linking.openURL('mailto:app@tlexinstitute.com');}}><Text style={{padding: 10, marginTop: 5, textAlign: 'center', color: COLORS.orange, fontFamily: 'Avenir-Book'}}>app@tlexinstitute.com</Text></TouchableOpacity>
        </View>
      </BaseContainer>
    );
  }
}

class Question extends React.PureComponent {

  state = {
    collapsed: true,
  };

  toggleExpanded = () => {
    this.setState({ collapsed: !this.state.collapsed });
  };

  render() {
    const { title, content } = this.props;
    const { collapsed } = this.state;
    return (
      <View style={styles.questionWrapper}>
        <TouchableOpacity onPress={this.toggleExpanded}>
          <View style={styles.questionHeader}>
            <Text style={styles.questionHeaderText}>{title}</Text>
            <View style={styles.questionHeaderArrow}><Ionicons name={collapsed ? "ios-arrow-down" : "ios-arrow-up"} style={{ color: COLORS.black }} size={20} /></View>
          </View>
        </TouchableOpacity>
        <Collapsible collapsed={this.state.collapsed} align="center">
          <View style={styles.questionContent}>
            <Text style={styles.questionContentText}>
              {content}
            </Text>
          </View>
        </Collapsible>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    marginTop: 15
  },
  questionWrapper: {
    backgroundColor: COLORS.lightblue,
    borderRadius: 20,
    padding: 7,
    paddingTop: 15,
    marginBottom: 15,
    minHeight: 35
  },
  questionHeader: {
    paddingLeft: 10,
    paddingRight: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  questionHeaderText: {
    color: COLORS.black,
    fontFamily: 'Avenir-Black',
    paddingRight: 8
  },
  questionHeaderArrow: {
    alignSelf: 'flex-end'
  },
  questionContent: {
    backgroundColor: COLORS.white,
    padding: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20
  },
  questionContentText: {
    textAlign: 'left',
    color: COLORS.gray,
    fontFamily: 'Avenir-Book',
    flexWrap: 'wrap',
  }
});
