import * as React from "react";
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, StatusBar } from "react-native";
import { Button, Icon } from "native-base";
import { FontAwesome, AntDesign } from '@expo/vector-icons';
import { BaseContainer, Styles, SectionTitle, BackArrow } from "../components";
import type { ScreenProps } from "../components/Types";
import { getResources } from "../../modules/firebaseAPI"
import COLORS from "../assets/Colors"
import variables from "../../native-base-theme/variables/commonColor";
import firebase from 'firebase';
import * as FirebaseAPI from "../../modules/firebaseAPI.js";
import { Ionicons } from "@expo/vector-icons";
import translate from "../../utils/language";


export default class Resources extends React.PureComponent<ScreenProps<>> {

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      mounted: true,
      resources: []
    }
  }

  async  componentDidMount() {
    const dataObj = await FirebaseAPI.getUser();
    this.setState({ workshopcode: dataObj.workshopcode });
    if (this.state.workshopcode != "") {
      this.setState({ mounted: true });
      this.readData();
    } else { this.setState({ loading: false }); }
  }

  async readData() {
    let resources = [];
    getResources().then((result) => {
      result.forEach(function (data) {
        let resource = data.val();
        resource.key = data.key;
        resources.push(resource);
      })
      this.setState({
        loading: false,
        resources: resources
      })
    }).catch(error => {
      this.setState({ loading: false })
    })
  }

  getIconName(mediaType) {
    switch (mediaType) {
      case 'pdf':
        return 'pdffile1';
      case 'video':
        return 'ios-videocam';
      default:
        return 'ios-document';
    }
  }

  render(): React.Node {
    const loadingCheck = this.state.loading;
    return (
      <BaseContainer title="Resources" navigation={this.props.navigation} scrollable webBackground>
        <StatusBar backgroundColor="white" barStyle="dark-content" />
        <SectionTitle label={translate("Workshop.workshop")} iconName="ios-photos" />

        {loadingCheck ? (
          <View style={style.actIndicator} >
            <ActivityIndicator size="large" color={COLORS.orange} />
          </View>
        ) : null
        }
        {

          this.state.workshopcode != "" ? (
            this.state.resources.map((resource) => {
              return <Item
                key={resource.key}
                title={resource.title}
                viewable
                icon={this.getIconName(resource.type)}
                onpres={() => { this.props.navigation.navigate("Pdf", { url: resource.url, title: resource.title }) }} />
            })
          ) :
            <View style={style.warningContainer}>
              <Ionicons name="ios-information-circle" size={24} style={style.warningIcon} />
              <Text style={style.warningText}>{translate("Workshop.only")}</Text>
            </View>
        }


      </BaseContainer>
    )
  }
}

type ItemProps = {
  title: string,
  viewable?: boolean,
  icon: string
};

type ItemState = {
  viewable: boolean
};

class Item extends React.Component<ItemProps, ItemState> {

  state = {
    viewable: false
  };

  static getDerivedStateFromProps({ viewable }: ItemProps): ItemState {
    return {
      viewable: !!viewable
    };
  }

  render(): React.Node {
    const { title } = this.props;
    const { onpres } = this.props;
    const { viewable } = this.state;
    const { icon } = this.props;

    const txtStyle = viewable ? Styles.grayText : Styles.grayText;
    return (
      <View style={[Styles.listItem, style.item, { borderColor: COLORS.orange }]}>
        <Button
          transparent
          onPress={onpres}
          style={[Styles.center, style.button]}
        >
          <AntDesign name={icon} size={22} style={{ color: COLORS.orange }} />
          {/* <Icon name={icon} style={txtStyle} /> */}
        </Button>
        <TouchableOpacity onPress={onpres} style={{ alignSelf: 'stretch', flex: 1, justifyContent: 'center' }}>
          <View style={style.title}>
            <Text style={[txtStyle, style.itemText]}>{title}</Text>
          </View>
        </TouchableOpacity>
        <View
          style={style.circleButton}
        >
          <TouchableOpacity onPress={onpres} style={{justifyContent: 'center' }}>
            <FontAwesome name={'chevron-right'} size={15} style={{ color: COLORS.white }} />
          </TouchableOpacity>
          {/* <Icon name={icon} style={txtStyle} /> */}
        </View>
      </View>
    );
  }
}

const style = StyleSheet.create({
  item: {
    marginHorizontal: 0,
    marginLeft: 20,
    marginRight: 20,
    alignItems: 'center'
  },
  itemText: {
    alignSelf: 'stretch',
    textAlign: 'left',
    color: COLORS.gray
  },
  button: {
    height: 75,
    width: 35,
    borderRadius: 0,
    alignSelf: 'flex-start'
  },
  circleButton: {
    borderRadius: 50,
    height: 30,
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.orange,
    alignSelf: 'center'
  },
  title: {
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 5,
    paddingRight: 5,
  },
  actIndicator: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  warningIcon: {
    color: COLORS.orange,
    marginRight: 15
  },
  warningContainer: {
    marginTop: 20,
    marginBottom: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  warningText: {
    fontSize: 15,
    color: COLORS.gray
  }
});