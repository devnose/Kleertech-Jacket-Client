import * as React from 'react';
import {useEffect, useRef} from 'react';
import {Animated, ScrollView} from 'react';


function DelayedZoom({delay, speed, endScale, startScale, children}) {
    const zoomAnim = useRef(new Animated.Value(startScale)).current;
    useEffect(() => {
      const zoomIn = () => {
        Animated.timing(zoomAnim, {
          delay: delay,
          toValue: endScale,
          duration: speed,
          useNativeDriver: true,
        }).start();
      };
      zoomIn();
    }, [zoomAnim]);
  
    return (
      <Animated.View
        style={[
          {
            transform: [{scale: zoomAnim}],
          },
        ]}>
        {children}
      </Animated.View>
    );
  }
  export default DelayedZoom