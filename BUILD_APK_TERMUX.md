# بناء APK لـ Haven Chess من Termux

## قبل البدء

Termux هنا يشغّل أدوات Expo فقط؛ أمر EAS يرفع المشروع إلى خوادم Expo ليتم تجميع APK هناك. لا يثبت Android SDK ولا ينفّذ بناء Gradle محليًا على الهاتف. يلزم اتصال إنترنت وحساب Expo. أوامر APK المعتمدة في Expo تستخدم ملف `eas.json` وملف التعريف `preview` الموجود في هذا المشروع.

**مهم لمحرك Stockfish:** التطبيق يستدعي `/api/chess/analyze` من خادم المشروع. رابط API الخاص بمعاينة Manus غير مضمّن تلقائيًا في نسخة EAS المستقلة، وليس عنوانًا صالحًا دائمًا. قبل البناء، يلزم تعيين `EXPO_PUBLIC_API_BASE_URL` إلى عنوان HTTPS ثابت لخادم Haven Chess يمكن للهاتف الوصول إليه. من دون ذلك يظل اللعب المحلي والكتب والدروس متاحًا، لكن تحليل Stockfish لن يتصل بالخادم. هذا العنوان إعداد عام داخل التطبيق وليس سرًا؛ لا تضع مفاتيح أو كلمات مرور في متغير يبدأ بـ `EXPO_PUBLIC_`.

## الأوامر على الهاتف

نزّل ملف `HavenChess-Termux.zip` إلى مجلد التنزيلات في الهاتف، ثم افتح Termux ونفّذ:

```sh
pkg update -y && pkg upgrade -y
pkg install -y nodejs-lts unzip
node -v
termux-setup-storage
mkdir -p ~/havenchess
unzip ~/storage/downloads/HavenChess-Termux.zip -d ~/havenchess
cd ~/havenchess
npm install --global eas-cli
eas login --device
eas build:configure -p android
```

يتطلب إصدار EAS CLI الحالي Node.js 22 أو أحدث. إذا كان `node -v` يعرض إصدارًا أقدم، حدّث حزمة Node في Termux قبل المتابعة. يسجّلك `eas login --device` باستخدام رمز تظهره أداة CLI وتكمله في المتصفح؛ لا ترسل كلمة مرور Expo إلى أي شخص.

إذا لم يكن خادم API قد نُشر بعد، لا تعتبر البناء اختبارًا لمحرك Stockfish. بعد توفير عنوانه الثابت، خزّنه في بيئة EAS المسماة `preview` ثم أعد البناء:

```sh
eas env:set --name EXPO_PUBLIC_API_BASE_URL --value https://YOUR-HAVEN-CHESS-API --environment preview --visibility plaintext
eas build --platform android --profile preview
```

استبدل `https://YOUR-HAVEN-CHESS-API` بعنوان الخادم الحقيقي؛ لا تستخدم عنوانًا توضيحيًا. إذا سجّلت متغير البيئة بعد إعداد المشروع، أعد البناء كي يُضمّن العنوان في التطبيق. في أول بناء، وافق على إنشاء Android keystore إذا طلب EAS ذلك، واحتفظ بنسخة آمنة منه. عند اكتمال البناء سيعرض EAS رابط APK؛ افتحه على الهاتف وثبّت التطبيق مع السماح بالتثبيت من مصدر Termux/المتصفح عند ظهور طلب Android.

لرفع التطبيق على Google Play تحتاج عادةً إلى AAB وبناء إنتاج منفصل؛ ملف APK هنا للتثبيت المباشر والاختبار.

## مصادر Expo الرسمية

- [إنتاج APK لأجهزة Android](https://docs.expo.dev/build-reference/apk/)
- [إعداد `eas.json`](https://docs.expo.dev/build/eas-json/)
- [EAS CLI](https://docs.expo.dev/eas/cli/)
- [متغيرات البيئة في EAS](https://docs.expo.dev/eas/environment-variables/)
