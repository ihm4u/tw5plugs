DISTDIR=editions/tidgraph/plugins/tidgraph
SRCDIR=src/plugins/tidgraph
JSSRC = utils.js widget.js
SRC= plugin.info $(shell cd $(SRCDIR) > /dev/null && ls *.tid doc/*.tid)
TARGETS=$(addprefix $(DISTDIR)/,$(JSSRC) $(SRC))
PROD=yes
$(info $(SRC))

.PHONY: all clean serve

targets: $(TARGETS)


prod: unlink $(TARGETS)

clean:
	rm $(TARGETS)

index: unlink $(TARGETS)
	rm -rf editions/tidgraph-github/{plugins,tiddlers}
	cp -R editions/tidgraph/plugins editions/tidgraph-github/
	cp -R editions/tidgraph/tiddlers editions/tidgraph-github/
	tiddlywiki editions/tidgraph-github --build index
	cp editions/tidgraph-github/output/index.html index.html

serve:
	rm -f $(DISTDIR)/utils.js
	ln -s `readlink -f $(SRCDIR)/utils.js` $(DISTDIR)
	bin/serve editions/tidgraph;
	while inotifywait -e move_self -e modify  $(DISTDIR)/utils.js; do \
		bin/serve -k; \
		bin/serve editions/tidgraph; \
	done

unlink:
	if [ -L "$(DISTDIR)/utils.js" ]; then rm -f "$(DISTDIR)/utils.js"; fi

$(DISTDIR)/%.js: $(SRCDIR)/%.js
	if [ "$(PROD)" ]; then \
		sed -ne '\#/\*\\#,\#\\\*/# p' "$^" > "$@" && \
		closure "$^" >> "$@"; \
	else \
	   cp "$^"  "$@"; \
	fi

$(DISTDIR)/plugin.info: $(SRCDIR)/plugin.info
	   cp "$^"  "$@";

$(DISTDIR)/%.tid: $(SRCDIR)/%.tid
	   cp "$^"  "$@";

$(DISTDIR)/doc/%.tid: $(SRCDIR)/doc/%.tid
	   cp "$^"  "$@";
