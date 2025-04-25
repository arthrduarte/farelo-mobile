import React, { useRef, useEffect } from 'react'
import { Animated, StyleSheet, ViewStyle } from 'react-native'

export function PulsingPlaceholder() {
  // start at 30% opacity
  const opacity = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start()
  }, [opacity])

  return (
    <Animated.View
      style={[
        styles.placeholder,
        { opacity },
      ]}
    />
  )
}

const styles = StyleSheet.create({
  placeholder: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#79320655',
    marginBottom: 16,
  } as ViewStyle,
})
