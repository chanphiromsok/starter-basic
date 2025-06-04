while getopts d: flag
do
    case "${flag}" in
        d) directory=${OPTARG};;
    esac
done



# Navigate to tovtam project
cd ../../tovtam
npx expo export -p android
# npx sentry-expo-upload-sourcemaps dist

# Navigate back to expo-updates-server
cd ../Desktop/start-basic

# Create directory and copy files
rm -rf updates/$directory/
mkdir -p updates/$directory/
cp -r ../../tovtam/dist/* updates/$directory/

node ./scripts/exportClientExpoConfig.js > updates/$directory/expoConfig.json