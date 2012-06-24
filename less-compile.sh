echo LESS will be compiled using lessc - to install it execute "npm install -g less". it requires node.js installed on your box
lessc source/less/VMM.Timeline.less > compiled/css/timeline.css -x --yui-compress
lessc source/less/Theme/Dark.less > compiled/css/themes/dark.css -x --yui-compress

echo "Compiling all LESS font files to CSS"
for file in source/less/Font/*.less
do
    FROM=$file
    TO=${file/.*/.css}
    echo "$FROM --> $TO"
    lessc $FROM > $TO -x --yui-compress
done

mv source/less/Font/*.css compiled/css/themes/font/