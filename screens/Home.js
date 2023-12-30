import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Text,
  View,
  StyleSheet,
  Image,
  Pressable,
  SectionList,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
/* import { useFonts } from "expo-font"; */
import * as SplashScreen from "expo-splash-screen";
import {
  createTable,
  getMenuItems,
  saveMenuItems,
  filterByQueryAndCategories,
} from "../database";
import { getSectionListData, useUpdateEffect } from "../utils/utils";
import Filters from "../components/Filters";
import { Searchbar } from "react-native-paper";
import debounce from "lodash.debounce";

SplashScreen.preventAutoHideAsync();

const API_URL =
  "https://raw.githubusercontent.com/andre1melo/rye-bakery/main/data/menu.json";
const sections = ["rolls", "loafs", "sweet", "drinks"];

const Item = ({ name, price, description, image }) => (
  <View style={styles.item}>
    <View style={styles.itemBody}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.description}>{description}</Text>
      <Text style={styles.price}>${price}</Text>
    </View>
    <Image
      style={styles.itemImage}
      source={{
        uri: `https://github.com/andre1melo/rye-bakery/blob/main/assets/img/${image}?raw=true`,
      }}
    />
  </View>
);

const Home = ({ navigation }) => {
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    orderStatuses: false,
    passwordChanges: false,
    specialOffers: false,
    newsletter: false,
    image: "",
  });
  const [data, setData] = useState([]);

  // Fetch JSON data
  const fetchData = async () => {
    try {
      const response = await fetch(API_URL);
      const json = await response.json();
      const menu = json.menu.map((item, index) => ({
        id: index + 1,
        name: item.name,
        price: item.price.toString(),
        description: item.description,
        image: item.image,
        category: item.category,
      }));
      return menu;
    } catch (error) {
      console.error(error);
    } finally {
    }
  };

  // SQLite and profile
  useEffect(() => {
    (async () => {
      let menuItems = [];
      try {
        await createTable();
        menuItems = await getMenuItems();
        if (!menuItems.length) {
          menuItems = await fetchData();
          saveMenuItems(menuItems);
        }
        const sectionListData = getSectionListData(menuItems);
        setData(sectionListData);
        const getProfile = await AsyncStorage.getItem("profile");
        setProfile(JSON.parse(getProfile));
      } catch (e) {
        Alert.alert(e.message);
      }
    })();
  }, []);

// Search bar and Filters
  const [searchBarText, setSearchBarText] = useState("");
  const [query, setQuery] = useState("");
  const [filterSelections, setFilterSelections] = useState(
    sections.map(() => false)
  );

  useUpdateEffect(() => {
    (async () => {
      const activeCategories = sections.filter((s, i) => {
        if (filterSelections.every(item => item === false)) {
          return true;
        }
        return filterSelections[i];
      });
      try {
        const menuItems = await filterByQueryAndCategories(
          query,
          activeCategories
        );
        const sectionListData = getSectionListData(menuItems);
        setData(sectionListData);
      } catch (e) {
        Alert.alert(e.message);
      }
    })();
  }, [filterSelections, query]);

  const lookup = useCallback(q => {
    setQuery(q);
  }, []);

  const debouncedLookup = useMemo(() => debounce(lookup, 500), [lookup]);

  const handleSearchChange = text => {
    setSearchBarText(text);
    debouncedLookup(text);
  };

  const handleFiltersChange = async index => {
    const arrayCopy = [...filterSelections];
    arrayCopy[index] = !filterSelections[index];
    setFilterSelections(arrayCopy);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          style={styles.logo}
          source={require("../assets/img/RyeBakeryLogo.png")}
          accessible={true}
          accessibilityLabel={"Rye Bakery Logo"}
        />
        <Pressable
          style={styles.avatarContainer}
          onPress={() => navigation.navigate("Profile")}
        >
          {profile.image ? (
            <Image source={{ uri: profile.image }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarEmpty}>
              <Text style={styles.avatarEmptyText}>
                {profile.firstName && Array.from(profile.firstName)[0]}
                {profile.lastName && Array.from(profile.lastName)[0]}
              </Text>
            </View>
          )}
        </Pressable>
      </View>
      <View style={styles.heroSection}>
        <Text style={styles.heroHeader}>Rye Bakery</Text>
        <View style={styles.heroBody}>
          <View style={styles.heroContent}>
            <Text style={styles.heroHeader2}>Bali, Indonesia</Text>
            <Text style={styles.heroText}>
              A small bakery on the south of Bali commited to bring you fresh delicious highest quality bread and more.
            </Text>
          </View>
          <Image
            style={styles.heroImage}
            source={require("../assets/img/RyeBakery.png")}
            accessible={true}
            accessibilityLabel={"Rye Bakery Food"}
          />
        </View>
      </View>
      <View style={styles.delivery}>
        <Text style={styles.deliveryText}>ORDER FOR DELIVERY!</Text>
        <Searchbar
          placeholder="Search"
          placeholderTextColor="#333333"
          onChangeText={handleSearchChange}
          value={searchBarText}
          style={styles.searchBar}
          iconColor="#333333"
          inputStyle={{ color: "#333333" }}
          elevation={0}
        />
      </View>
      <Filters
        selections={filterSelections}
        onChange={handleFiltersChange}
        sections={sections}
      />
      <SectionList
        style={styles.sectionList}
        sections={data}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Item
            name={item.name}
            price={item.price}
            description={item.description}
            image={item.image}
          />
        )}
        renderSectionHeader={({ section: { name } }) => (
          <Text style={styles.itemHeader}>{name}</Text>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Constants.statusBarHeight,
  },
  header: {
    padding: 12,
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  logo: {
    height: 50,
    width: 150,
    resizeMode: "contain",
  },
  avatarContainer: {
    flex: 1,
    position: "absolute",
    right: 10,
    top: 10,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarEmpty: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#0b9a6a",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEmptyText: {
    fontSize: 22,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  heroSection: {
    backgroundColor: "#916226",
    padding: 15,
  },
  heroHeader: {
    color: "#f4ce14",
    fontSize: 54,
    fontFamily: "MarkaziText-Medium",
  },
  heroHeader2: {
    color: "#fff",
    fontSize: 30,
    fontFamily: "MarkaziText-Medium",
  },
  heroText: {
    color: "#fff",
    fontFamily: "Karla-Medium",
    fontSize: 14,
  },
  heroBody: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heroContent: {
    flex: 1,
  },
  heroImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  sectionList: {
    paddingHorizontal: 16,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#cccccc",
    paddingVertical: 10,
  },
  itemBody: {
    flex: 1,
  },
  itemHeader: {
    fontSize: 24,
    paddingVertical: 8,
    color: "#916226",
    backgroundColor: "#fff",
    fontFamily: "Karla-ExtraBold",
  },
  name: {
    fontSize: 20,
    color: "#000000",
    paddingBottom: 5,
    fontFamily: "Karla-Bold",
  },
  description: {
    color: "#916226",
    paddingRight: 5,
    fontFamily: "Karla-Medium",
  },
  price: {
    fontSize: 20,
    color: "#EE9972",
    paddingTop: 5,
    fontFamily: "Karla-Medium",
  },
  itemImage: {
    width: 100,
    height: 100,
  },
  delivery: {
    padding: 10,
    paddingTop: 8,
    backgroundColor: "#F4CE14",
  },
  deliveryText: {
    fontSize: 18,
    fontFamily: "Karla-ExtraBold",
    textAlign: "center",
  },
  searchBar: {
    marginTop: 8,
    marginBottom: 5,
    backgroundColor: "#e4e4e4",
    shadowRadius: 0,
    shadowOpacity: 0,
  },
});

export default Home;
