import React, { Component } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import ButtonGD from "../components/ButtonGD";
import { BaseContainer, SectionTitle} from "../components";
import COLORS from "../assets/Colors";
import translate from "../../utils/language";
export default class Impressum extends Component {


  handleImpressum(){
    this.props.navigation.goBack();
  }

  render() {

    return (
      <BaseContainer>
      <SectionTitle label={translate("About.about")} iconName="ios-filing" />
        <View style={{ flex: 1, paddingBottom: 30, alignItems: 'center'}}>
          <ScrollView style={{ flex: 1, padding: 15}}>
            <Text style={{ fontSize: 14, color: COLORS.gray, paddingBottom: 15}}>
              {translate("About.desc")}
            </Text>
          </ScrollView>
          <ButtonGD onpress={()=>{this.handleImpressum()}} title={translate("About.back")} style={{alignSelf: 'flex-end', color: COLORS.orange}}>
          </ButtonGD>
        </View>
      </BaseContainer>

    )
  }
}