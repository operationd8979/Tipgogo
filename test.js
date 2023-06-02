import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native'

const Test = () => {
  const [routes, setRoutes] = useState([
    { id: 'route1', coordinates: [{ lat: 10.801141, lng: 106.637899 }, { lat: 10.799550, lng: 106.640956 }] },
    { id: 'route2', coordinates: [{ lat: 10.801036, lng: 106.636887 }, { lat: 10.799159, lng: 106.637357 }] },
    { id: 'route3', coordinates: [{ lat: 10.799125, lng: 106.641791 }, { lat: 10.797641, lng: 106.644487 }] },
    { id: 'route4', coordinates: [{ lat: 10.795697, lng: 106.638270 }, { lat: 10.792497, lng: 106.639342 }] },
  ]);
  const [shortestPaths, setShortestPaths] = useState([]);

  useEffect(() => {
    findShortestPaths();
  }, []);

  const findShortestPaths = () => {
    let minDistance = Number.MAX_VALUE;
    let maxDistance = Number.MIN_VALUE;
    let shortestPath1 = [];
    let shortestPath2 = [];

    for (let i = 0; i < routes.length; i++) {
      for (let j = 0; j < routes.length; j++) {
        if (i === j) continue;

        const path1 = calculateDistance([{ lat: 10.805000, lng: 106.635414 }, ...routes[i].coordinates, ...routes[j].coordinates, { lat: 10.783812, lng: 106.661724 }]);
        const path2 = calculateDistance([{ lat: 10.805000, lng: 106.635414 }, ...routes[i].coordinates, ...routes[j].coordinates, { lat: 10.783812, lng: 106.661724 }]);

        if (path1 < minDistance) {
          minDistance = path1;
          shortestPath1 = [routes[i], routes[j]];
        }

        if (path2 > maxDistance) {
          maxDistance = path2;
          shortestPath2 = [routes[i], routes[j]];
        }
      }
    }

    setShortestPaths([shortestPath1, shortestPath2]);
  };

  const calculateDistance = (path) => {
    let distance = 0;

    for (let i = 0; i < path.length - 1; i++) {
      const lat1 = path[i].lat;
      const lng1 = path[i].lng;
      const lat2 = path[i + 1].lat;
      const lng2 = path[i + 1].lng;

      const dLat = toRadians(lat2 - lat1);
      const dLng = toRadians(lng2 - lng1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const segmentDistance = 6371 * c; // Earth's radius is approximately 6371 km

      distance += segmentDistance;
    }

    return distance;
  };

  const toRadians = (angle) => {
    return angle * (Math.PI / 180);
  };

  return (
    <View>
      {shortestPaths.map((path, index) => (
        <View key={index}>
          <Text>Shortest Path {index + 1}:</Text>
          {path.map((route) => (
            <Text key={route.id}>{route.id}</Text>
          ))}
        </View>
      ))}
    </View>
  );
};

export default Test;