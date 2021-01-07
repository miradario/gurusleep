import * as React from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  Image,
  StatusBar,
  ActivityIndicator
} from "react-native";
import { Video } from "expo-av";
import Images from "../components/images";
import { Button, Text } from "native-base";
import Icon from "react-native-vector-icons/FontAwesome5";
import {Ionicons} from "@expo/vector-icons";
import WindowDimensions from "../components/WindowDimensions";
import * as challengesAPI from "../../modules/challengesAPI.js";
import { BaseContainer } from "../components";
import { Styles } from "../components";
import type { ScreenProps } from "../components/Types";
import { LinearGradient } from 'expo-linear-gradient';
import variables from "../../native-base-theme/variables/commonColor";
import firebase from "firebase";
import translate from "../../utils/language";
import ChallengeControls from "../components/ChallengeControls";
import COLORS from "../assets/Colors";
import i18n from "i18n-js";
import ButtonGD from "../components/ButtonGD";
import * as Matomo from 'react-native-matomo';
import * as commonFunctions from '../../utils/common.js';
import { checkInternetConnection } from 'react-native-offline';

export default class Challenges extends React.PureComponent<ScreenProps<>> {
  constructor(props) {
    var x;

    super(props);
    this.state = {
      listingNotstarted: [],
      listingCurrent: [],
      listing: [],
      listingFinished: [],
      cat: [translate("Challenge.current"), translate("Challenge.notstarted"), translate("Challenge.finished")],
      selectedCat: 0,
      loadingChallenges: true,
      connected: true
    };
  }

  async componentDidMount() {
    commonFunctions.matomoTrack('screen', 'Challenges');
    this.focusListener = this.props.navigation.addListener("didFocus", () => {
      this.database = firebase.database();
      const userId = firebase.auth().currentUser.uid;
      let i = 0;
      let q = this.database.ref("/Users/" + userId + "/Challenge").orderByChild('daystart');
      var finished_arr = [];
      var notstarted_arr = [];
      var current = [];
      this.setState({ selectedCat: 0 })

      q.once("value", snapshot => {
        snapshot.forEach(function (data) {
          let result = data.val();
          result["key"] = data.key;
          if (result.active == 'current') {
            let result = data.val();
            result["key"] = data.key;
            let currentday = challengesAPI.current_day(result.daystart);
            let finished = challengesAPI.finished(currentday);
            let completed = challengesAPI.completed_days(data);
            let notstarted = false;
            let notstart = (currentday == -1) ? notstarted = true : notstarted = false;

            if (notstarted) {
              notstarted_arr.push(result);
            }
            else {
              if (finished) {
                finished_arr.push(result);
              }
              else {
                current.push(result);
              }
            }
          }
        });
      }).then(() => {

        this.setState({
          listingNotstarted: notstarted_arr,
          listingfinished: finished_arr,
          listingCurrent: current,
          qch: 0,
          listing: current,
          loadingChallenges: false
        });

      });
    });
    this.setState({connected: await checkInternetConnection()})
  }

  handleCategoryChange = (category, id) => {
    const current = this.state.listingCurrent;
    const finished = this.state.listingfinished;
    const notstarted = this.state.listingNotstarted;
    if (category == translate("Challenge.current")) { this.setState({ listing: current }) }
    if (category == translate("Challenge.finished")) { this.setState({ listing: finished }) }
    if (category == translate("Challenge.notstarted")) { this.setState({ listing: notstarted }) }
    this.setState({ contentReady: false, selectedCat: id, qch: 0 })
  }

  render(): React.Node {
    const {connected} = this.state
    if (connected) {    
      return (
        <BaseContainer
          title="Challenges"
          navigation={this.props.navigation}
          scrollable
          //webBackground
        >
          <StatusBar backgroundColor="white" barStyle="dark-content" />
          <View style={{position: 'absolute', bottom: 0, right: 0}}><Image source={Images.dog_bg} style={style.backgroundImage}/></View>
          <View style={{ height: 70, alignItems: 'center' }}>
            <FlatList
              refresh={this.state.selectedCat}
              data={this.state.cat}
              horizontal
              renderItem={({ item, index }) =>
                <CategoryButton category={item} categoryChange={this.handleCategoryChange} id={index} active={(this.state.selectedCat == index)} />
              }
              keyExtractor={(item, index) => index.toString()}
              ListHeaderComponentStyle={{ justifyContent: 'space-between' }}
            />
          </View>
          {this.state.loadingChallenges && <ActivityIndicator color={COLORS.orange} size="large" />}
          {
            !this.state.loadingChallenges &&
            this.state.listing.map(x => {
              let currentday = challengesAPI.current_day(x.daystart);
              let finished = challengesAPI.finished(currentday);
              let completed = challengesAPI.completed_days(x);

              if (finished) {
                i = i + 1;
              }

              if (x.active == "current") {
                if (!finished) {
                  i = i + 1;
                  this.state.qch++;
                }

                notstarted = (currentday == -1) ?  true :  false;
                let daychecked = x["day" + currentday];
                let overdue = challengesAPI.abandoned(
                  finished,
                  daychecked,
                  completed,
                  currentday
                );

                title = notstarted ? x.title :
                x.title + "  (" + completed + "/21)";
                infoCompleted = notstarted ? translate("Challenge.starts") + x.daystart : completed + translate("Challenge.completed");
                infoAbandoned = notstarted ? "" : overdue + " " + translate("Challenge.abandoned");
                if (finished) { x.title + " - " + translate("Challenge.Challengefinished"); }

                
                let dayshow = (currentday == -1) ? 0 : currentday;

                return (
                  <ChallengeControls
                    key={x.key}
                    pkey={x.key}
                    finished={finished}
                    notstarted={notstarted}
                    daysCompleted={dayshow}
                    title={title}
                    infoCompleted={infoCompleted}
                    infoAbandoned={infoAbandoned}
                    image={x.image}
                    navigation={this.props.navigation}
                    onmountain={() => {
                      this.props.navigation.navigate("Mountain", {
                        pkey: x.key,
                        title: x.title,
                        why: x.why,
                        mountain: x.mountain
                      });
                    }}
                    onedit={() => {
                      this.props.navigation.navigate("Create", {
                        pkey: x.key,
                        ptitle: x.title,
                        image: x.image
                      });
                    }}
                  ></ChallengeControls>
                );
              }

            })}
          {this.state.listingCurrent.length < 3 && this.state.selectedCat < 2 ? (
            <View style={style.buttonWrapper}>
              <ButtonGD
                title={translate("Challenge.createChallenge")}
                onpress={() => {
                  this.props.navigation.navigate("Create");
                }
                }
              />
            </View>
          ) : null } 
          
          {this.state.listingCurrent.length >= 3 && this.state.selectedCat < 2  ? (
              <View style={style.warningContainer}>
                <Ionicons name="ios-information-circle" size={24} style={style.warningIcon} />
                <Text style={style.warningText}>{translate("Challenge.limit")}</Text>
              </View>
            ) : null
          }

          {this.state.listing.length < 1 && this.state.selectedCat == 2 ? (
              <View style={style.warningContainer}>
                <Ionicons name="ios-information-circle" size={24} style={style.warningIcon} />
                <Text style={style.warningText}>{translate("Challenge.no_completed")}</Text>
              </View>
            ) : null
          }        
        </BaseContainer>
      );
    } else {
      return (
        <NoInternet />
      )
    }
  }
}

const NoInternet = () => (
  <BaseContainer>
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      <View style={{marginTop: 10, padding: 30, alignContent: 'center'}}>
          <Text style={{color: COLORS.gray, fontSize: 15, textAlign: 'center'}}>{translate("Mindfulness.nointernet")}</Text>
      </View>
  </BaseContainer>
)

type ItemProps = {
  title: string,
  // eslint-disable-next-line react/no-unused-prop-types
  done?: boolean,
  viewable?: boolean
};

type ItemState = {
  done: boolean,
  viewable: boolean
};

class Item extends React.Component<ItemProps, ItemState> {
  state = {
    done: false,
    viewable: false
  };

  static getDerivedStateFromProps({ done, viewable }: ItemProps): ItemState {
    return { done: !!done, viewable: !!viewable };
  }

  renderCheck(txtStyle) {
    let check;

    if (this.state.done == true) {
      check = <Icon name="edit" size={15} style={txtStyle} />;
    }
    return check;
  }

  render(): React.Node {
    const { title } = this.props;
    const { onpres } = this.props;
    const { onedit } = this.props;
    const { onmountain } = this.props;
    const { done } = this.state;
    const { viewable } = this.state;
    const { key } = this.state;
    const txtStyle = viewable ? Styles.whiteText : Styles.grayText;
    return (
      <View style={[Styles.listItem, style.item]}>
        <Button
          transparent
          onPress={onedit}
          key={onedit}
          style={[Styles.center, style.button]}
        >
          {this.renderCheck(txtStyle)}
        </Button>
        <Button
          transparent
          onPress={onmountain}
          key={onmountain}
          style={[Styles.center, style.button]}
        >
          <Icon name="image" style={[txtStyle]} size={15} />
        </Button>

        <TouchableOpacity onPress={onpres}>
          <View style={style.title}>
            <Text style={txtStyle}>{title}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

class CategoryButton extends React.PureComponent {

  handleCategoryChange = () => {
    this.setState({ selected: true })
    this.props.categoryChange(this.props.category, this.props.id)
  }

  render() {
    return (
      <TouchableOpacity activeOpacity={0.5} onPress={() => { this.handleCategoryChange() }}>
        <LinearGradient
          colors={[this.props.active ? COLORS.blue : COLORS.orange, this.props.active ? COLORS.lightblue : COLORS.lightorange]}
          start={[0.6, 0.5]}
          end={[1, 0]} 
          style={style.categoryTitle}>
          <Text style={style.thumbcategoryText}>{this.props.category}</Text>
        </LinearGradient>
      </TouchableOpacity>
    )
  }
}

const style = StyleSheet.create({
  title: {
    color: "white",
    textAlign: "left",
    fontSize: 100,
    fontWeight: "bold",
    fontFamily: "Avenir-Black"
  },
  dot: {
    fontSize: 70,
    color: '#f26f21'
  },

  item: {
    marginHorizontal: 0
  },
  button: {
    height: 75,
    width: 75,
    borderRadius: 0
  },
  title: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: variables.contentPadding
  },
  actionIcon: {
    paddingLeft: 20
  },
  backgroundImage: {
    height: WindowDimensions.height/2.5, 
    width: (WindowDimensions.height/2.5)*(520/755)
  },
  header: {
    width: WindowDimensions.width,
    height: 83,
    resizeMode: "contain",
    flex: 1,
    position: "absolute",
    top: 0,
    zIndex: 1000
  },
  loginButton: {
    marginTop: 20,
    paddingTop: 15,
    paddingBottom: 15,
    marginRight: 15,
    backgroundColor: COLORS.orange,
    borderRadius: 25,
    width: 200,
    alignContent: "center"
  },
  categoryTitle: {
    height: 30,
    padding: 15,
    paddingTop: 0,
    paddingBottom: 0,
    marginTop: 25,
    marginRight: 15,
    backgroundColor: COLORS.blue,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonWrapper: {
    marginTop: 20
  },
  thumbcategoryText: {
    fontSize: 16,

    textAlign: "center",
    color: COLORS.white
  },
  warningContainer: {
    marginTop: 20,
    marginBottom: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  warningText: {
    fontSize: 13,
    color: COLORS.gray
  },
  warningIcon: {
    color: COLORS.orange,
    marginRight: 15
  }
});
