import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  header: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#3742D1',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#3742D1',
  },
  content: {
    fontSize: 12,
    lineHeight: 1.5,
  },
  image: {
    marginVertical: 15,
    maxHeight: 200,
    alignSelf: 'center',
  },
});

const parseAnalysisContent = (content) => {
  if (!content) return 'No data available';
  if (typeof content === 'string') return content;
  if (content.analysis) return content.analysis;
  return JSON.stringify(content, null, 2);
};

const DrawingAnalysisPDF = ({ drawingTitle, childName, childAge, imageUrl, analysis }) => {
  // Handle all possible analysis formats
  const safeAnalysis = analysis || {};
  
  return (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.header}>Drawing Analysis Report</Text>
        
        {/* Basic Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Drawing Information</Text>
          <Text style={styles.content}>Title: {drawingTitle || 'Untitled Drawing'}</Text>
          <Text style={styles.content}>Child: {childName || 'Not specified'}</Text>
          <Text style={styles.content}>Age: {childAge || 'Not specified'}</Text>
        </View>

        {/* Drawing Image */}
        {imageUrl && (
          <Image 
            src={imageUrl} 
            style={styles.image}
            alt="Child's drawing"
          />
        )}

        {/* Analysis Sections */}
        {['emotional', 'cognitive', 'creative'].map((section) => (
          <View key={section} style={styles.section}>
            <Text style={styles.sectionTitle}>
              {section.charAt(0).toUpperCase() + section.slice(1)} Indicators
            </Text>
            <Text style={styles.content}>
              {parseAnalysisContent(safeAnalysis[section])}
            </Text>
          </View>
        ))}

        {/* Recommendations Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          {safeAnalysis.recommendations?.actions?.length > 0 ? (
            safeAnalysis.recommendations.actions.map((item, index) => (
              <Text key={index} style={[styles.content, { marginLeft: 10 }]}>
                • {item}
              </Text>
            ))
          ) : (
            <Text style={styles.content}>No recommendations available</Text>
          )}
        </View>
      </Page>
    </Document>
  );
};

export default DrawingAnalysisPDF;