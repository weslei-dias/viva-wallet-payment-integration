/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import type {Node} from 'react';
import React, {useRef, useState} from 'react';
import {
  Alert,
  Button,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import axios from 'axios';
import qs from 'qs';
import WebView from 'react-native-webview';

const {height: initialHeight} = Dimensions.get('window');

const getSearchParamFromURL = (url, param) => {
  const include = url.includes(param);

  if (!include) {
    return null;
  }

  const params = url.split(/([?,=])/);
  const index = params.indexOf(param);
  const value = params[index + 2];
  return value;
};

const App: () => Node = () => {
  const [cardName, setCardName] = useState();
  const [orderNumber, setOrderNumber] = useState();
  const [disable, setDisable] = useState(false);
  const webViewRef = useRef<WebView>(null);
  const [height, setHeight] = useState(initialHeight);
  const [visible, setVisible] = useState(false);

  const onPay = async () => {
    const data = qs.stringify({
      grant_type: 'client_credentials',
    });

    const token = await axios
      .post('https://demo-accounts.vivapayments.com/connect/token', data, {
        'Content-Type': 'application/x-www-form-urlencoded',
        auth: {
          username:
            'hqhlfjmp7kcm39dtn7y0gc3rsdn1q2k60xgig310m04x2.apps.vivapayments.com',
          password: 'BQj6Oc8e0H9W5xiSt4FDeCABZi22OK',
        },
      })
      .then(res => res.data.access_token);

    console.log('TOKEN');
    if (token) {
      const form = {
        amount: 1234,
        customerTrns: 'Transaction Details',
        customer: {
          email: 'example@test.com',
          fullName: cardName,
          phone: 'Phone Number',
          countryCode: 'GB',
          requestLang: 'en-GB',
        },
        paymentTimeout: 3600,
        preauth: false,
        allowRecurring: false,
        tipAmount: 0,
        sourceCode: 'Default',
        merchantTrns: 'Order Number 12345',
      };

      const orderNum = await axios
        .post('https://demo-api.vivapayments.com/checkout/v2/orders', form, {
          headers: {Authorization: 'Bearer ' + token},
        })
        .then(res => res.data.orderCode);

      if (orderNum) {
        console.log(orderNum);
        setOrderNumber(orderNum);
        setVisible(true);
      }
    }
  };

  return (
    <SafeAreaView style={{height: '100%'}}>
      <StatusBar barStyle={'light-content'} />
      <ScrollView style={{height: '100%'}}>
        {!visible && (
          <View style={{margin: 8}}>
            <Text style={{fontSize: 18}}>Card name</Text>
            <TextInput
              style={{borderWidth: 1}}
              onChangeText={setCardName}
              value={cardName}
            />
            <Text style={{fontSize: 18}}>Email</Text>
            <TextInput
              style={{borderWidth: 1}}
              onChangeText={setCardName}
              value={cardName}
            />
            <View style={{marginTop: 10}}>
              <Button onPress={onPay} title={'Pay'} />
            </View>
          </View>
        )}
        {visible && (
          <View style={{margin: 8, height: height - 40}}>
            <WebView
              ref={webViewRef}
              enableApplePay
              cacheEnabled={false}
              showsVerticalScrollIndicator
              javaScriptEnabled
              nestedScrollEnabled
              onNavigationStateChange={value => {
                console.log(value);
                // if (value.loading) {
                //   setDisable(true);
                // }
                if (value.title === 'Transaction details - Viva Payments') {
                  if (getSearchParamFromURL(value.url, 't')) {
                    Alert.alert('Payment Successful');
                    setVisible(false);
                  } else if (
                    getSearchParamFromURL(value.url, 't') === null &&
                    getSearchParamFromURL(value.url, 'eventId')
                  ) {
                    setDisable(true);
                  }
                }
              }}
              source={{
                uri: 'https://demo.vivapayments.com/web2?ref=' + orderNumber,
              }}
            />
            <View style={{marginTop: 1}}>
              <Button
                disabled={disable}
                onPress={() => setVisible(!visible)}
                title={'Cancel'}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
