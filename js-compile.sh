cd source/js/Embed
cat "../lib/Embed.LoadLib.js" Embed.js > "../../../compiled/js/timeline-embed-full.js"
cd ..
cat VMM.Timeline.License.js "Core/VMM.js" "Core/VMM.Library.js" "Core/VMM.Browser.js" "Core/VMM.FileExtention.js" "Core/VMM.Date.js" "Core/VMM.Util.js" "Core/VMM.LoadLib.js" "Media/VMM.ExternalAPI.js" "Media/VMM.MediaElement.js" "Media/VMM.MediaType.js" "Media/VMM.Media.js" "Media/VMM.TextElement.js" "Slider/VMM.TouchSlider.js" "Slider/VMM.DragSlider.js" "Slider/VMM.Slider.js" "Slider/VMM.Slider.Slide.js" VMM.Language.js "lib/AES.js" "lib/bootstrap-tooltip.js" VMM.Timeline.js VMM.Timeline.TimeNav.js VMM.Timeline.DataObj.js > "../../compiled/js/timeline.js"
cd ../..
echo minifying .js files using Google Closure
java -jar compiler.jar --compilation_level SIMPLE_OPTIMIZATIONS --js compiled/js/timeline-embed-full.js > compiled/js/timeline-embed.js
rm compiled/js/timeline-embed-full.js
java -jar compiler.jar --compilation_level SIMPLE_OPTIMIZATIONS --js compiled/js/timeline.js > compiled/js/timeline-min.js
cp source/js/locale/*.js compiled/js/locale