import React from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import COLORS from "../assets/Colors";

export class Question extends React.Component {
 

    renderBullets = () => {
        return this.props.bullets.map((bullet, key) => {
            return (
                <Text
                    key={key}
                    style={[styles.defaultBulletStyle, this.props.bulletStyle]}
                >
                    {bullet}
                </Text>
            )
        }
        )
    }
    render() {
        return (
            <View
                key={this.props.key}
                style={[styles.defaultContainerStyle, this.props.containerStyle]}>
                <Text style={[styles.defaultTitleStyle, this.props.titleStyle]}>
                    {this.props.question}
                </Text>
                <Text style={[styles.defaultReplyStyle, this.props.replyStyle]}>
                    {this.props.reply}
                </Text>
                {/* Optional BULLETS */}
                {this.props.bullets ?
                    <View style={{ display: 'flex', textAlign: 'center' }}>
                        {this.renderBullets()}
                    </View>
                    :
                    <Text />
                }
                {/* Optional ACTION */}
                {this.props.actionText ?
                    <TouchableOpacity
                        style={[styles.defaultActionStyle, this.props.actionStyle]}
                        onPress={this.props.onClick ? this.props.onClick : null}
                    >
                        <Text style={[styles.defaultActionTextStyle, this.props.actionTextStyle]}>
                            {this.props.actionText}
                        </Text>
                    </TouchableOpacity>
                    :
                    <Text />}
            </View>
        )
    }
}

export class FAQ extends React.Component {




    renderQuestions = (questions) => {
        return questions.map((question, index) => {
            console.log(index, { ...question });

            return <Question
                key={index}
                {...question}
            />
        })
    }

    render() {
        const renderedQuestions = this.renderQuestions(this.props.questions)
        return (
            <View style={[styles.defaultFAQContainerStyle, this.props.containerStyle]}>
                <View style={[styles.defaultFAQTitleContainerStyle, this.props.titleContainerStyle]}>
                    <Text style={[styles.defaultFAQTextStyle, this.props.titleStyle]}>
                        {this.props.title}
                    </Text>
                </View>
                <View style={[styles.defaultFAQQuestionContainerStyle, this.props.questionContainerStyle]}>
                    {renderedQuestions}
                </View>
            </View>
        )
    }

}


const styles = StyleSheet.create({
    defaultBulletStyle: {
        marginLeft: '10%'
    },
    defaultContainerStyle: {
        backgroundColor: COLORS.lightblue,
        margin: 2,
        borderRadius: 5
    },
    defaultTitleStyle: {
        fontSize: 20
    },
    defaultReplyStyle: {
        fontSize: 15
    },
    defaultActionStyle: {
        backgroundColor: "black",
        borderRadius: 5,
        margin: 5
    },
    defaultActionTextStyle: {
        fontSize: 25,
        color: COLORS.white,
        textAlign: "center"
    },
    defaultFAQContainerStyle: {
    },
    defaultFAQTitleContainerStyle: {
    },
    defaultFAQTextStyle: {
        fontSize: 30,
        color: COLORS.white,
        textAlign: 'center'
    },
    defaultFAQQuestionContainerStyle: {
        color: COLORS.white,
    }
});