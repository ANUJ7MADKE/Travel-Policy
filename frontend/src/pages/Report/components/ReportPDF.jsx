import React from 'react';
import { Page, Text, View, Document, StyleSheet, PDFViewer } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: 'white',
    padding: 20
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1
  },
  viewer: {
    width: '75vw', // Full width
    height: '100vh' // Full height
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    borderRightWidth: 0,
    borderBottomWidth: 0
  },
  tableRow: {
    flexDirection: 'row'
  },
  tableColHeader: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    backgroundColor: '#f2f2f2',
    padding: 5,
    textAlign: 'center'
  },
  tableCol: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    padding: 5,
    textAlign: 'center'
  },
  tableCellHeader: {
    margin: 5,
    fontSize: 12,
    fontWeight: 'bold'
  },
  tableCell: {
    margin: 5,
    fontSize: 10
  }
});

// Create Document Component
const ReportPDF = ({ tableData }) => (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>ID</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Stream</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Scholarship</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Purpose of Travel</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Funds</Text>
            </View>
          </View>
          {tableData?.map((row) => (
            <View key={row.id} style={styles.tableRow}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{row.id}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{row.Stream}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{row.Scholarship}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{row.Purpose_of_Travel}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{row.Funds}</Text>
              </View>
            </View>
          ))}
        </View>
      </Page>
    </Document>
);

export default ReportPDF;