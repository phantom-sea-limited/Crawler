wget -O js-snackbar.min.js https://github.com/mickelsonmichael/js-snackbar/raw/master/dist/js-snackbar.min.js
tsc && webpack

rm ../nhimmeo.user.js
cat nhimmeo.md dist/nhimmeo.user.js >> ../nhimmeo.user.js
