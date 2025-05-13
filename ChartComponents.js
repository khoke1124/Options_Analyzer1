// Directory structure
/*
options_analyzer_mobile/
├── src/
│   ├── components/
│   │   ├── ChartComponents.js
│   │   ├── OptionChain.js
│   │   ├── StrategyForm.js
│   │   └── Analysis.js
│   ├── screens/
│   │   ├── HomeScreen.js
│   │   ├── StrategyScreen.js
│   │   ├── AnalysisScreen.js
│   │   └── ProfileScreen.js
│   ├── services/
│   │   ├── api.js
│   │   └── auth.js
│   └── utils/
│       ├── constants.js
│       └── helpers.js
├── App.js
└── package.json
*/

// ChartComponents.js
import React from 'react';
import { Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { WebView } from 'react-native-webview';

export const PayoffChart = ({ data }) => {
  const screenWidth = Dimensions.get('window').width;
  
  return (
    <LineChart
      data={{
        labels: data.map(point => point.price),
        datasets: [{
          data: data.map(point => point.payoff)
        }]
      }}
      width={screenWidth}
      height={220}
      chartConfig={{
        backgroundColor: '#ffffff',
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        decimalPlaces: 2,
        color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
        style: {
          borderRadius: 16
        }
      }}
      bezier
      style={{
        marginVertical: 8,
        borderRadius: 16
      }}
    />
  );
};

export const RiskAnalysisChart = ({ data }) => {
  // Using D3.js in WebView for complex visualizations
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <script src="https://d3js.org/d3.v7.min.js"></script>
        <style>
          .radar-chart {
            width: 100%;
            height: 300px;
          }
        </style>
      </head>
      <body>
        <div id="chart" class="radar-chart"></div>
        <script>
          const data = ${JSON.stringify(data)};
          // D3.js radar chart implementation
          // ... (implementation details)
        </script>
      </body>
    </html>
  `;

  return (
    <WebView
      source={{ html }}
      style={{ height: 300 }}
    />
  );
};

// OptionChain.js
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

const OptionChain = ({ data, onSelect }) => {
  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.row}
      onPress={() => onSelect(item)}
    >
      <Text style={styles.cell}>{item.strike}</Text>
      <Text style={styles.cell}>{item.callBid}</Text>
      <Text style={styles.cell}>{item.callAsk}</Text>
      <Text style={styles.cell}>{item.putBid}</Text>
      <Text style={styles.cell}>{item.putAsk}</Text>
      <Text style={styles.cell}>{(item.iv * 100).toFixed(1)}%</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerCell}>Strike</Text>
        <Text style={styles.headerCell}>Call Bid</Text>
        <Text style={styles.headerCell}>Call Ask</Text>
        <Text style={styles.headerCell}>Put Bid</Text>
        <Text style={styles.headerCell}>Put Ask</Text>
        <Text style={styles.headerCell}>IV</Text>
      </View>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.strike.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 8,
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    padding: 8,
  },
  cell: {
    flex: 1,
    textAlign: 'center',
  },
});

export default OptionChain;

// api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://your-api-url/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getOptionChain = async (ticker, expiration) => {
  try {
    const response = await api.get('/options/chain', {
      params: { ticker, expiration }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createStrategy = async (strategyData) => {
  try {
    const response = await api.post('/strategies', strategyData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// StrategyScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { PayoffChart } from '../components/ChartComponents';
import OptionChain