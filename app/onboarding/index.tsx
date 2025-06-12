// apps/client/screens/onboarding/index.tsx

import React, { useRef, useState } from 'react'
import {
  StyleSheet,
  View,
  Dimensions,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { ThemedText } from '@/components/ThemedText'

const { width, height } = Dimensions.get('window')
const IMAGE_HEIGHT = height * 0.35

const slides = [
  {
    key: '1',
    image: require('@/assets/images/onboarding/onboarding-image-1.png'),
    title: 'Make it special',
    subtitle: 'Turn everyday cooking into moments you can share.',
  },
  {
    key: '2',
    image: require('@/assets/images/onboarding/onboarding-image-2.png'),
    title: 'Scan with AI',
    subtitle: 'Import recipes from the web or from your camera roll',
  },
  {
    key: '3',
    image: require('@/assets/images/onboarding/onboarding-image-3.png'),
    title: 'Cook & Share',
    subtitle: 'See what your friends have been up to in the kitchen.',
  },
  {
    key: '4',
    image: require('@/assets/images/onboarding/onboarding-image-3.png'),
    title: 'Meet Jacquin',
    subtitle: 'Your personal AI chef assistant.',
  },
]

export default function OnboardingCarousel() {
  const router = useRouter()
  const scrollRef = useRef<ScrollView>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const onMomentumScrollEnd = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width)
    setCurrentIndex(idx)
  }

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      scrollRef.current?.scrollTo({ x: width * (currentIndex + 1), animated: true })
    } else {
      router.push('/onboarding/register')
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <SafeAreaView style={styles.safeArea}>
        {/* SWIPEABLE AREA: only image + text */}
        <View style={styles.carouselWrapper}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onMomentumScrollEnd}
          >
            {slides.map((slide) => (
              <View key={slide.key} style={[styles.slide, { width }]}>
                <View style={[styles.imageContainer, { height: IMAGE_HEIGHT }]}>
                  <Image source={slide.image} style={styles.image} resizeMode="cover" />
                </View>
                <View style={styles.textContainer}>
                  <ThemedText type="title" style={styles.title}>
                    {slide.title}
                  </ThemedText>
                  <ThemedText style={styles.subtitle}>{slide.subtitle}</ThemedText>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* STATIC FOOTER: dots + Next button */}
        <View style={styles.footer}>
          <View style={styles.dotsContainer}>
            {slides.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === currentIndex && styles.activeDot,
                ]}
              />
            ))}
          </View>
          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <ThemedText type="defaultSemiBold" style={styles.buttonText}>
              {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { 
    flex: 1
  },
  safeArea: {
    flex: 1, 
    backgroundColor: '#793206'
  },
  carouselWrapper: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
  },
  imageContainer: {
    width,
    backgroundColor: '#793206', // brown placeholder
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    flex: 1,
    backgroundColor: '#ede4d2',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width,
    paddingHorizontal: 24,
    paddingTop: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 12,
    color: '#793206',
  },
  subtitle: {
    fontSize: 16,
    color: '#793206',
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 22,
  },

  footer: {
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#ede4d2',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C4C4C4',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#793206',
  },
  button: {
    backgroundColor: '#793206',
    paddingVertical: 14,
    borderRadius: 12,
    width: width * 0.8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
  },
})
