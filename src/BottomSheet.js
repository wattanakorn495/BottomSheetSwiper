import React, {useRef} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  StatusBar,
  Animated,
  PanResponder,
  Button,
} from 'react-native';

const TOTAL_HEIGHT = Dimensions.get('window').height - StatusBar.currentHeight;
const START_HEIGHT = 120;
const THRESHOLD = (TOTAL_HEIGHT - START_HEIGHT) / 4;

const animate = (target, toValue) => {
  Animated.spring(target, {
    toValue,
    overshootClamping: true,
    useNativeDriver: true,
  }).start();
};

export default function BottomSheet() {
  const isOpened = useRef(false);
  const offsetFromTop = useRef(new Animated.Value(TOTAL_HEIGHT - START_HEIGHT))
    .current;
  const offsetFromTopClamp = offsetFromTop.interpolate({
    inputRange: [-1, 0, TOTAL_HEIGHT - START_HEIGHT, TOTAL_HEIGHT],
    outputRange: [
      0,
      0,
      TOTAL_HEIGHT - START_HEIGHT,
      TOTAL_HEIGHT - START_HEIGHT,
    ],
  });

  const bg = useRef(new Animated.Value(0)).current;
  const bgColor = bg.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(200,30,30,0.3)', 'rgba(30,30,200,0.3)'],
  });

  const panResponder = React.useRef(
    PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return true;
      },
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

      onPanResponderGrant: (evt, gestureState) => {
        // The gesture has started. Show visual feedback so the user knows
        // what is happening!
        // gestureState.d{x,y} will be set to zero now
        bg.setValue(1);
      },
      onPanResponderMove: (evt, gestureState) => {
        evt.nativeEvent.locationY;
        // The most recent move distance is gestureState.move{X,Y}
        // The accumulated gesture distance since becoming responder is
        // gestureState.d{x,y}
        console.log(
          gestureState.moveY,
          evt.nativeEvent.locationY,
          evt.nativeEvent.pageY,
        );
        // offsetFromTop.setValue(gestureState.moveY);
        offsetFromTop.setOffset(gestureState.dy);
      },
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onPanResponderRelease: (evt, {moveY}) => {
        offsetFromTop.flattenOffset();
        // The user has released all touches while this view is the
        // responder. This typically means a gesture has succeeded
        bg.setValue(0);
        if (isOpened.current) {
          // can close
          if (moveY > THRESHOLD) {
            isOpened.current = false;
            console.log('opened -> close');
            return animate(offsetFromTop, TOTAL_HEIGHT - START_HEIGHT);
          }
          return animate(offsetFromTop, 0);
        } else {
          // can open
          if (moveY < TOTAL_HEIGHT - START_HEIGHT - THRESHOLD) {
            console.log('close -> opend!');
            isOpened.current = true;
            return animate(offsetFromTop, 0);
          }
          return animate(offsetFromTop, TOTAL_HEIGHT - START_HEIGHT);
        }
      },
      onPanResponderTerminate: (evt, gestureState) => {
        // Another component has become the responder, so this gesture
        // should be cancelled
        bg.setValue(0);
      },
      onShouldBlockNativeResponder: (evt, gestureState) => {
        // Returns whether this component should block native components from becoming the JS
        // responder. Returns true by default. Is currently only supported on android.
        return true;
      },
    }),
  ).current;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            {
              translateY: offsetFromTopClamp,
            },
          ],
          //   backgroundColor: bgColor,
        },
      ]}>
      <View {...panResponder.panHandlers} style={styles.pullHandler} />
      <View style={{marginTop: 30, width: '50%', alignSelf: 'center'}}>
        <Button title="OK" onPress={() => console.log('OK!!')} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    // borderWidth: 2,
    borderColor: 'red',
    height: Dimensions.get('window').height - StatusBar.currentHeight,
    width: Dimensions.get('window').width,
    backgroundColor: '#F4F4F4',
    elevation: 5
  },
  pullHandler: {
    position: 'absolute',
    width: '100%',
    height: 140,
    // backgroundColor: 'tomato',
    top: -10,
  },
});
