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
const IMAGE_HEIGHT = height * 0.4

const slides = [
  {
    key: '1',
    image: require('@/assets/images/onboarding/onboarding-image-1.png'),
    title: 'Your recipes made easy',
    subtitle: 'Save and organize all your favorite recipes in one place.',
  },
  {
    key: '2',
    image: require('@/assets/images/onboarding/onboarding-image-2.png'),
    title: 'Scan with AI',
    subtitle: 'Import any recipe from a photo or URL instantly.',
  },
  {
    key: '3',
    image: require('@/assets/images/onboarding/onboarding-image-3.png'),
    title: 'Cook & Share',
    subtitle: 'Track meals, log progress, and share with friends.',
  },
]

export default function OnboardingCarousel() {
  const router = useRouter()
  const scrollRef = useRef<ScrollView>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const onMomentumScrollEnd = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width)
    setCurrentIndex(index)
  }

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      scrollRef.current?.scrollTo({ x: width * (currentIndex + 1), animated: true })
    } else {
      router.push('/onboarding/problem')
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumScrollEnd}
        >
          {slides.map((slide, idx) => (
            <View key={slide.key} style={[styles.slide, { width }]}>
              <View style={[styles.imageContainer, { height: IMAGE_HEIGHT }]}>
                <Image source={slide.image} style={styles.image} resizeMode="cover" />
              </View>
              <View style={[styles.bottomContainer, { height: height - IMAGE_HEIGHT }]}>
                <View>
                  <ThemedText type="title" style={styles.title}>
                    {slide.title}
                  </ThemedText>
                  <ThemedText style={styles.subtitle}>{slide.subtitle}</ThemedText>
                </View>

                <View style={styles.footer}>
                  <View style={styles.dotsContainer}>
                    {slides.map((_, dotIdx) => (
                      <View
                        key={dotIdx}
                        style={[
                          styles.dot,
                          dotIdx === currentIndex && styles.activeDot,
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
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  slide: {
    flex: 1,
  },
  imageContainer: {
    backgroundColor: '#7A3700', // fallback while image loads
  },
  image: {
    width: '100%',
    height: '100%',
  },
  bottomContainer: {
    backgroundColor: '#ede4d2',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
    color: '#793206',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#793206',
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 22,
  },
  footer: {
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
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
    paddingVertical: 16,
    borderRadius: 12,
    width: width * 0.8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
  },
})
