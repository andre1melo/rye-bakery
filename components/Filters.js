import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

const Filters = ({ onChange, selections, sections }) => {
  return (
    <View style={styles.filtersContainer}>
      {sections.map((section, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => {
            onChange(index);
          }}
          style={{
            flex: 1 / sections.length,
            justifyContent: "center",
            alignItems: "center",
            padding: 10,
            backgroundColor: selections[index] ? "#916226" : "#edefee",
            borderRadius: 9,
            marginRight: 10,
          }}
        >
          <View>
            <Text
              style={{
                fontFamily: "Karla-ExtraBold",
                color: selections[index] ? "#edefee" : "#916226",
              }}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  filtersContainer: {
    backgroundColor: "#F4CE14",
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 10,
    paddingLeft: 10,
  },
});

export default Filters;
