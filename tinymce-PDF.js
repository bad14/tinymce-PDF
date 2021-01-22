jQuery(document).ready(function ($) {
	tinymce.init({
      selector: '#bodynote',
     // plugins: 'advcode casechange linkchecker autolink lists checklist media mediaembed pageembed powerpaste table advtable tinymcespellchecker image',
      plugins: [
	    'advlist autolink lists link image charmap print preview anchor',
	    'searchreplace visualblocks code fullscreen',
	    'insertdatetime media table paste code help wordcount'
	  ],
	  menubar: 'edit view insert format tools table tc',
      //toolbar: 'casechange checklist code pageembed permanentpen table image',
      toolbar: 'undo redo | formatselect | image | media |' +
	  'bold italic backcolor | alignleft aligncenter ' +
	  'alignright alignjustify | bullist numlist | ' +
	  'removeformat | pageembed | casechange | code',
      toolbar_mode: 'floating',
      file_picker_types: 'file image media',
      image_title: true,
	  /* enable automatic uploads of images represented by blob or data URIs*/
	  automatic_uploads: true,
	  images_upload_url: 'upload_img',
	  /* and here's our custom image picker*/
	  file_picker_callback: function (cb, value, meta) {
		if (meta.filetype === 'image') {
			console.log('image');
			var input = document.createElement('input');
			input.setAttribute('type', 'file');
			input.setAttribute('accept', 'image/*');

			input.onchange = function () {
			var file = this.files[0];

			var reader = new FileReader();
			reader.onload = function () {
				var id = 'imgcontent' + (new Date()).getTime();
				var blobCache =  tinymce.activeEditor.editorUpload.blobCache;
				var base64 = reader.result.split(',')[1];
				var blobInfo = blobCache.create(id, file, base64);
				blobCache.add(blobInfo);

				/* call the callback and populate the Title field with the file name */
				cb(blobInfo.blobUri(), { title: file.name });
			};
			reader.readAsDataURL(file);
			};

			input.click();
		}
    //if the filetype is media, or the upload clic comes from media plugin/icon
		if (meta.filetype === 'media') {
      //the field fieldupload have to be present in html code in the next way
			//<input type="file" id="fileupload" hidden>
			console.log('file');
			jQuery("#fileupload").trigger("click");
			$("#fileupload").unbind('change');
			// File selection
			jQuery("#fileupload").on("change", function () {
				var file = this.files[0];
				var reader = new FileReader();

				// FormData
				var fd = new FormData();
				var files = file;
				fd.append("file", files);
				fd.append('filetype', meta.filetype);

				var filename = "";

				// AJAX
				var url = 'upload_url';

				jQuery.ajax({
					url: url,
					type: "post",
					data: fd,
					contentType: false,
					processData: false,
					async: false,
					dataType:"json",
					success: function (response) {
						console.log('filename-', response.location);
						filename = response.location;
					}
				});

				reader.onload = function (e) {
					//poner el nombre del archivo en el formulario
					cb(filename, {source2: filename, poster: filename});
					
				};
				reader.readAsDataURL(file);
			});
		}
	  },
	  	// callback para convertir el elemento en un object PDF
	  	init_instance_callback: function (editor) {

			editor.on('BeforeSetContent', function (e) {
			console.log('before - ', e.content);

			if (e.content.indexOf("video ") > 0) {
				if (e.content.indexOf(".pdf") > 0) {
					e.content = e.content.replace("<video", "<div");

					var width = e.content.match("width=\"(.*)\" height");
					var height = e.content.match("height=\"(.*)\" controls");
					//console.log('width - ', width, ' height - ', height);

					e.content = e.content.replace("controls=\"controls\"", "");

					e.content = e.content.replace("<source", "<object");
					e.content = e.content.replace("src=", "data=");

					e.content = e.content.replace("</video", "</div");
					e.content = e.content.replace("/>", "type=\"application/pdf\" width=\"" + width[1] + "\" height=\"" + height[1] + "\"  ></object>");
				}

				console.log('after - ', e.content);
			}
			});
		},
	  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
    });
    )};
		       
		       ///credits to https://gist.github.com/muhadmr/89f4ac92b3cca2a2df4f466947e0332d
